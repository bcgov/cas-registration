from typing import List, Optional
from ninja import Field, ModelSchema, Schema
from registration.constants import AUDIT_FIELDS
from registration.models import Operation
from datetime import date
from .contact import ContactSchema


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
    email: Optional[str] = None
    phone_number: Optional[str] = None
    # external application lead details
    external_lead_first_name: Optional[str] = None
    external_lead_last_name: Optional[str] = None
    external_lead_position_title: Optional[str] = None
    external_lead_email: Optional[str] = None
    external_lead_phone_number: Optional[str] = None
    # shared application lead details
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    is_user_application_lead: Optional[bool] = None
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
    application_lead: Optional[ContactSchema]
    operation_has_multiple_operators: Optional[bool] = Field(False, alias="operation_has_multiple_operators")
    multiple_operators_array: Optional["List[MultipleOperatorOut]"] = Field(None, alias="multiple_operator")
    operator: str = Field(..., alias="operator.legal_name")

    class Config:
        model = Operation
        model_exclude = [*AUDIT_FIELDS, "naics_code"]


from .multiple_operator import MultipleOperatorOut

OperationOut.update_forward_refs()


class OperationUpdateStatusIn(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["status"]
