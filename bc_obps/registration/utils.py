import logging
from django.db.models import QuerySet
from typing import Any, List, TypeVar, Union, Iterable, Dict, Optional
from uuid import UUID
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from django.http import HttpRequest

from registration.constants import UNAUTHORIZED_MESSAGE, DEFAULT_API_NAMESPACE
import requests
import base64
import re
import hashlib
from django.core.files.base import ContentFile
from ninja.errors import HttpError
from registration.models import Document, Operation, Operator, User, UserOperator, Facility, BcGreenhouseGasId
from django.urls import reverse_lazy
from datetime import datetime
from zoneinfo import ZoneInfo
from ninja.types import DictStrAny
from ninja.pagination import PageNumberPagination


logger = logging.getLogger(__name__)

TModel = TypeVar('TModel', bound=models.Model)


def update_model_instance(
    instance: TModel,
    fields_to_update: Union[Iterable[str], Dict[str, str]],
    data_dict: DictStrAny,
) -> TModel:
    """
    Update the provided data model instance with values from data_dict based on the field mappings.

    Args:
        instance: An instance of a data model.
        fields_to_update (dict or Iterable): A dictionary mapping fields in data_dict to instance fields
            or an iterable of fields to update.
        data_dict (dict): A dictionary containing the data to update the instance with.

    Returns:
        instance (models.Model): The updated instance.
    """
    if isinstance(fields_to_update, dict):
        for data_key, instance_key in fields_to_update.items():
            if data_key in data_dict and hasattr(instance, instance_key):
                setattr(instance, instance_key, data_dict[data_key])
    else:
        for field in fields_to_update:
            if field in data_dict and hasattr(instance, field):
                setattr(instance, field, data_dict[field])
    try:
        # Perform full validation of the instance based on the model's field constraints.
        instance.full_clean()
    except ValidationError as e:
        raise ValidationError(e)
    except IntegrityError as e:
        raise IntegrityError(e)

    # We don't save the instance here; This allows further operations or validation before the actual save.
    return instance


def generate_useful_error(error: ValidationError) -> Optional[str]:
    """
    Generate a useful error message from a ValidationError.
    NOTE: this only returns the first error message until we can figure out a better way to handle multiple errors in the client side.
    """
    for key, value in error.message_dict.items():
        formatted_key = ' '.join(word.capitalize() for word in key.split('_'))
        return f"{formatted_key}: {value[0]}"
    return None


def raise_401_if_user_not_authorized(
    request: HttpRequest,
    authorized_app_roles: List[str],
    authorized_user_operator_roles: Optional[List[str]] = None,
    industry_user_must_be_approved: bool = True,
) -> None:
    """
    Raise a 401 error if a user is not authorized. To be authorized the user must:
        - be logged in (request.current_user exists)
        - have an authorized app_role
        - if the user's app_role is industry_user, then they must additionally have status = 'Approved' in the user_operator table unless industry_user_must_be_approved is set to False (defaults to True)
    """
    if not hasattr(request, 'current_user'):
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    user: User = request.current_user
    role_name = getattr(user.app_role, "role_name")
    if role_name not in authorized_app_roles:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)

    if user.is_industry_user():
        # We always need to pass authorized_user_operator_roles if the user is an industry user
        if not authorized_user_operator_roles:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        if industry_user_must_be_approved:
            approved_user_operator = user.user_operators.filter(status=UserOperator.Statuses.APPROVED).exists()
            if not approved_user_operator:
                raise HttpError(401, UNAUTHORIZED_MESSAGE)
        # If authorized_user_operator_roles is the same as all industry user operator roles, then we can skip the check (Means all industry user roles are authorized)
        if sorted(authorized_user_operator_roles) != sorted(UserOperator.get_all_industry_user_operator_roles()):
            user_operator_role = None
            try:
                user_operator = (
                    UserOperator.objects.exclude(status=UserOperator.Statuses.DECLINED)
                    .only('role')
                    .get(user=user.user_guid)
                )
                user_operator_role = user_operator.role
            except UserOperator.DoesNotExist:
                pass
            if not user_operator_role or user_operator_role not in authorized_user_operator_roles:
                raise HttpError(401, UNAUTHORIZED_MESSAGE)


# File helpers
def file_to_data_url(document: Document) -> Optional[str]:  # type: ignore[return] # we dont break the function if something goes wrong in this function
    """
    Transforms a Django FieldField record into a data url that RJSF can process.
    """
    timeout_seconds = 10
    try:
        response = requests.get(document.file.url, timeout=timeout_seconds)
        if response.status_code == 200:
            document_content = response.content
            encoded_content = base64.b64encode(document_content).decode("utf-8")
            # only pdf format is allowed
            return "data:application/pdf;name=" + document.file.name.split("/")[-1] + ";base64," + encoded_content  # type: ignore[no-any-return]
        else:
            logger.error(f"Request to retrieve file failed with status code {response.status_code}")
    except requests.exceptions.Timeout:
        # Handle the timeout exception
        logger.exception(f"Request timed out after {timeout_seconds} seconds")
    except requests.exceptions.RequestException as e:
        # Handle other types of exceptions (e.g., connection error)
        logger.exception(f"An error occurred: {e}")


def data_url_to_file(data_url: str) -> ContentFile:
    """
    Transforms a data url into a ContentFile that Django can insert into the db and add to google cloud storage
    """
    name_pattern = re.search(r'name=([^;]+)', data_url)
    file_name = name_pattern.group(1) if name_pattern else None
    _, encoded_data = data_url.split(',')

    # Decode the base64-encoded data
    file_data = base64.b64decode(encoded_data)
    return ContentFile(file_data, file_name)


def custom_reverse_lazy(view_name: str, *args: Any, **kwargs: DictStrAny) -> Union[str, Any]:
    """
    A custom reverse_lazy function that includes the default API namespace.
    """
    return reverse_lazy(f"{DEFAULT_API_NAMESPACE}:{view_name}", *args, **kwargs)


def set_verification_columns(record: Union[UserOperator, Operator, Operation], user_guid: UUID) -> None:
    record.verified_at = datetime.now(ZoneInfo("UTC"))
    record.verified_by_id = user_guid


def files_have_same_hash(file1: Optional[ContentFile], file2: Optional[ContentFile]) -> bool:
    """
    Compare the hash of two files to determine if they are the same.
    this might miss formatting changes.
    """

    # If either file is None, raise an error
    if not file1 or not file2:
        raise ValueError("Both files must be provided to compare hashes.")

    hash1 = hashlib.sha256()
    hash2 = hashlib.sha256()

    try:
        # Handle ContentFile
        if isinstance(file1, ContentFile):
            hash1.update(file1.read())
        else:
            # Handle FileField
            with file1.open(mode='rb') as f1:
                for chunk in iter(lambda: f1.read(4096), b''):
                    hash1.update(chunk)

        # Repeat for the second file
        if isinstance(file2, ContentFile):
            hash2.update(file2.read())
        else:
            with file2.open(mode='rb') as f2:
                for chunk in iter(lambda: f2.read(4096), b''):
                    hash2.update(chunk)

        return hash1.hexdigest() == hash2.hexdigest()
    except Exception as e:
        raise ValueError(f"Error comparing files: {e}")


class CustomPagination(PageNumberPagination):
    """
    Custom pagination class that allows for custom page sizes.
    If paginate_result is set to True, the page size will be set to the default page size, otherwise it will be set to the total count of the queryset (no pagination).
    """

    def paginate_queryset(
        self,
        queryset: QuerySet,
        pagination: PageNumberPagination.Input,
        **params: Any,
    ) -> Any:
        paginate_result = params.get('paginate_result')
        page_size = self.page_size if paginate_result else queryset.count()
        offset = (pagination.page - 1) * page_size
        return {
            "items": queryset[offset : offset + page_size],
            "count": self._items_count(queryset),
        }  # noqa: E203


def generate_unique_bcghg_id_for_operation_or_facility(record: Operation | Facility) -> None:
    """
    Generate a unique BCGHG ID for an operation or facility based on the operation type, NAICS code, and the latest BCGHG ID with the same type and code.
    """
    # if the operation or facility already has a BCGHG ID, do nothing
    if record.bcghg_id:
        return None

    operation = record.current_designated_operation if isinstance(record, Facility) else record

    # this is to make mypy happy. NAICS code is a required field in the db
    if not operation.naics_code:
        raise ValueError('BCGHG cannot be generated. Missing NAICS code.')

    if operation.type == 'Single Facility Operation':
        first_digit = '1'
    elif operation.type == 'Linear Facility Operation':
        first_digit = '2'
    else:
        raise ValueError(f"Invalid operation type: {operation.type}")

    naics_code = operation.naics_code.naics_code
    latest_bcghg_id = (
        BcGreenhouseGasId.objects.filter(id__startswith=str(first_digit + naics_code))
        .order_by('-id')
        .values_list('id', flat=True)
        .first()
    )

    if latest_bcghg_id:
        new_bcghg_id = str(int(latest_bcghg_id) + 1)
    else:
        new_bcghg_id = str(f"{first_digit}{naics_code}{1:04d}")  # Pad the number with zeros to make it 4 digits long
    new_bcghg_id_instance = BcGreenhouseGasId.objects.create(id=new_bcghg_id)
    record.bcghg_id = new_bcghg_id_instance
