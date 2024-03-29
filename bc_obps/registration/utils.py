from typing import List, Type, Union, Iterable, Dict, Any, Tuple, Optional
from uuid import UUID
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from django.db.models import QuerySet
from registration.constants import UNAUTHORIZED_MESSAGE, DEFAULT_API_NAMESPACE
import requests, base64, re
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from registration.models import (
    Document,
    User,
    Operator,
    User,
    UserOperator,
)
from django.urls import reverse_lazy
from datetime import datetime
import pytz
from typing import Optional
from registration.models import (
    Operator,
    User,
    UserOperator,
)


def check_users_admin_request_eligibility(user: User, operator: Operator) -> Union[None, tuple[int, dict]]:
    """
    Check if a user is eligible to request admin access to an operator.

    Args:
        user (User): The user for whom eligibility is being checked.
        operator (Operator): The operator to which admin access is being requested.

    Returns:
        Union[None, Tuple[int, str]]: Eligibility status. None if eligible, (400, error message) if not.
    """
    # User already has an admin user for this operator
    if UserOperator.objects.filter(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        return 400, {"message": "You are already an admin for this Operator!"}

    # Operator already has an admin user
    if UserOperator.objects.filter(
        operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        return 400, {"message": "This Operator already has an admin user!"}

    # User already has a pending request for this operator
    # NOTE: This is a bit of a weird case, but it's possible for a user to have a pending request for an operator
    #       and if we show the UserOperator request form, they could submit another request and end up with two Contact
    if UserOperator.objects.filter(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
    ).exists():
        return 400, {"message": "You already have a pending request for this Operator!"}

    return 200, None


def update_model_instance(
    instance: Type[models.Model],
    fields_to_update: Union[Iterable[str], Dict[str, str]],
    data_dict: Dict[str, Any],
) -> Type[models.Model]:
    """
    Update the provided data model instance with values from data_dict based on the field mappings.

    Args:
        instance (Type[models.Model]): An instance of a data model.
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


def generate_useful_error(error):
    """
    Generate a useful error message from a ValidationError.
    NOTE: this only returns the first error message until we can figure out a better way to handle multiple errors in the client side.
    """
    for key, value in error.message_dict.items():
        formatted_key = ' '.join(word.capitalize() for word in key.split('_'))
        return f"{formatted_key}: {value[0]}"


def check_access_request_matches_business_guid(
    user_guid: str, operator: Operator
) -> Tuple[int, Optional[Union[dict[str, str], None]]]:
    """
    Check if a the business_guid of a subsequent user who is requesting access matches the business_guid of the admin

    Args:
        user_guid (User): The guid of the user for whom eligibility is being checked.
        operator (Operator): The operator to which access is being requested.

    Returns:
        Union[None, Tuple[int, str]]: Eligibility status. None if eligible, (400, error message) if not.
    """
    admin_user_operator_data = UserOperator.objects.filter(
        operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).first()
    # Operator already has an admin user
    admin_user = get_object_or_404(User, user_guid=admin_user_operator_data.user.user_guid)
    current_user = get_object_or_404(User, user_guid=user_guid)

    if admin_user.business_guid != current_user.business_guid:
        return 403, {"message": "Your business bceid does not match that of the approved admin."}

    return 200, None


def raise_401_if_user_not_authorized(
    request,
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


def get_current_user_approved_user_operator_or_raise(user: User) -> Optional[UserOperator]:
    user_operator = user.get_approved_user_operator()
    if not user_operator:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    return user_operator


def get_an_operators_approved_users(operator_pk: int) -> QuerySet[UUID]:
    # get a list of all the operator's approved user ids
    user_ids = UserOperator.objects.filter(operator_id=operator_pk, status=UserOperator.Statuses.APPROVED).values_list(
        'user_id', flat=True
    )

    return User.objects.filter(pk__in=user_ids).values_list('user_guid', flat=True)


# File helpers
def file_to_data_url(document: Document):
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
            return "data:application/pdf;name=" + document.file.name.split("/")[-1] + ";base64," + encoded_content
        else:
            print(f"Request to retrieve file failed with status code {response.status_code}")
    except requests.exceptions.Timeout:
        # Handle the timeout exception
        print(f"Request timed out after {timeout_seconds} seconds")

    except requests.exceptions.RequestException as e:
        # Handle other types of exceptions (e.g., connection error)
        print(f"An error occurred: {e}")


def data_url_to_file(data_url: str):
    """
    Transforms a data url into a ContentFile that Django can insert into the db and add to google cloud storage
    """
    file_name = re.search(r'name=([^;]+)', data_url).group(1)
    _, encoded_data = data_url.split(',')

    # Decode the base64-encoded data
    file_data = base64.b64decode(encoded_data)
    return ContentFile(file_data, file_name)


def custom_reverse_lazy(view_name, *args, **kwargs) -> str:
    """
    A custom reverse_lazy function that includes the default API namespace.
    """
    return reverse_lazy(f"{DEFAULT_API_NAMESPACE}:{view_name}", *args, **kwargs)


def set_verification_columns(record, user_guid):
    record.verified_at = datetime.now(pytz.utc)
    record.verified_by_id = user_guid
