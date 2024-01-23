from typing import List, Optional
from registration.utils import file_to_data_url, data_url_to_file
from ninja import Field, ModelSchema, Schema
from registration.constants import AUDIT_FIELDS
from registration.models import Operation, Document
from datetime import date
from .contact import ContactSchema
from pydantic import validator


#### Operation schemas


class OperationCreateOut(Schema):
    id: int
    name: str


class OperationCreateIn(ModelSchema):
    # Converting types
    verified_at: Optional[date] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None
    statutory_declaration: Optional[str] = None
    # boundary_map: Optional[str] = None

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
    # point of contact details
    point_of_contact_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position_title: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    # external point of contact details
    external_point_of_contact_first_name: Optional[str] = None
    external_point_of_contact_last_name: Optional[str] = None
    external_point_of_contact_position_title: Optional[str] = None
    external_point_of_contact_email: Optional[str] = None
    external_point_of_contact_phone_number: Optional[str] = None
    # shared point of contact details
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    add_another_user_for_point_of_contact: Optional[bool] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None
    statutory_declaration: Optional[str] = None

    @validator("statutory_declaration")
    @classmethod
    def validate_statutory_declaration(cls, value: str):
        if value:
            return data_url_to_file(value)

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
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    bcghg_id: Optional[str] = None
    opt_in: Optional[bool] = None
    verified_at: Optional[date] = None
    point_of_contact: Optional[ContactSchema]
    point_of_contact_id: int = Field(None, alias="point_of_contact.id")
    operation_has_multiple_operators: Optional[bool] = Field(False, alias="operation_has_multiple_operators")
    multiple_operators_array: Optional["List[MultipleOperatorOut]"] = Field(None, alias="multiple_operator")
    operator: str = Field(..., alias="operator.legal_name")
    statutory_declaration: str = None

    @staticmethod
    def resolve_statutory_declaration(obj: Document):
        statutory_declaration = obj.get_statutory_declaration()
        if statutory_declaration:
            return file_to_data_url(statutory_declaration)
        return None

    class Config:
        model = Operation
        model_exclude = [*AUDIT_FIELDS, "naics_code"]


from .multiple_operator import MultipleOperatorOut

OperationOut.update_forward_refs()


class OperationUpdateStatusIn(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["status"]
