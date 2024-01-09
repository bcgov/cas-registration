from typing import List, Optional
from ninja import Field, ModelSchema, Schema
from registration.models import Operation, Document
from datetime import date
from registration.utils import AUDIT_FIELDS
from .contact import ContactSchema
import requests
import base64
from django.core.files.base import ContentFile
import re

# Helpers, move somewhere more general later brianna


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


#### Operation schemas


class OperationCreateOut(Schema):
    id: int
    name: str


class OperationCreateIn(ModelSchema):
    # Converting types
    verified_at: Optional[date] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_exclude = [
            "id",
            *AUDIT_FIELDS,
        ]  # need to exclude id since it's auto generated and we don't want to pass it in
        allow_population_by_field_name = True


class OperationUpdateOut(Schema):
    name: str


class OperationUpdateIn(ModelSchema):
    # Converting types
    verified_at: Optional[date] = None
    # application lead details
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position_title: Optional[str] = None
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    is_application_lead_external: Optional[bool] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_exclude = [
            "id",
            *AUDIT_FIELDS,
        ]  # need to exclude id since it's auto generated and we don't want to pass it in
        allow_population_by_field_name = True


class OperationOut(ModelSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    bcghg_id: Optional[str] = None
    opt_in: Optional[bool] = None
    verified_at: Optional[date] = None
    is_application_lead_external: Optional[bool] = None
    application_lead: Optional[ContactSchema]
    operation_has_multiple_operators: Optional[bool] = Field(False, alias="operation_has_multiple_operators")
    multiple_operators_array: Optional["List[MultipleOperatorOut]"] = Field(None, alias="multiple_operator")

    class Config:
        model = Operation
        model_exclude = [*AUDIT_FIELDS, "operator", "naics_code"]


from .multiple_operator import MultipleOperatorOut

OperationOut.update_forward_refs()


class OperationUpdateStatusIn(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["status"]
