import logging
import os
from django.db.models import QuerySet
from typing import Any, TypeVar, Union, Iterable, Dict, Optional
from uuid import UUID
from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from registration.constants import DEFAULT_API_NAMESPACE
import requests
import base64
import re
from django.core.files.base import ContentFile
from registration.models import (
    Document,
    Operation,
    Operator,
    UserOperator,
)
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
        if key == '__all__':  # ignore adding formatted key for general error message like constraints
            return value[0]  # Return the general error message directly
        formatted_key = ' '.join(word.capitalize() for word in key.split('_'))
        return f"{formatted_key}: {value[0]}"
    return None


# File helpers
def file_to_data_url(document: Document) -> Optional[str]:  # type: ignore[return] # we dont break the function if something goes wrong in this function
    """
    Transforms a Django FieldField record into a data url that RJSF can process.
    """
    timeout_seconds = 10
    # Handles local storage when running in CI
    if os.environ.get("CI", None) == "true":
        encoded_content = base64.b64encode(document.get_file_content().read()).decode("utf-8")
        return "data:application/pdf;name=" + document.file.name.split("/")[-1] + ";scanstatus=" + document.status + ";base64," + encoded_content  # type: ignore[no-any-return]
    else:
        try:
            response = requests.get(document.get_file_url(), timeout=timeout_seconds)
            if response.status_code == 200:
                document_content = response.content
                encoded_content = base64.b64encode(document_content).decode("utf-8")
                # only pdf format is allowed
                return "data:application/pdf;name=" + document.file.name.split("/")[-1] + ";scanstatus=" + document.status + ";base64," + encoded_content  # type: ignore[no-any-return]
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
