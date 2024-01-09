from typing import List, Optional
from ninja import Field, ModelSchema, Schema
from registration.models import Operation, Document
from datetime import date
from registration.utils import AUDIT_FIELDS, file_to_data_url
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
    boundary_map: Optional[str] = None
    name: str

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
    boundary_map: str = None

    @staticmethod
    def resolve_boundary_map(obj: Document):
        boundary_map = obj.get_boundary_map()
        if boundary_map:
            return file_to_data_url(boundary_map)
        return None

    class Config:
        model = Operation
        model_exclude = [*AUDIT_FIELDS, "operator", "naics_code"]


from .multiple_operator import MultipleOperatorOut

OperationOut.update_forward_refs()


class OperationUpdateStatusIn(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["status"]
