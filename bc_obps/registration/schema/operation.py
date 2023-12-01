from typing import Optional
from ninja import Field
from ninja import ModelSchema, Schema
from registration.models import Operation, Contact
from datetime import date
from .contact import ContactSchema


#### Operation schemas


class OperationCreateOut(Schema):
    id: int
    name: str


class OperationCreateIn(ModelSchema):
    operator_id: int
    # Converting types
    naics_code_id: int
    verified_at: Optional[date] = None

    class Config:
        model = Operation
        model_exclude = ["id"]  # need to exclude id since it's auto generated and we don't want to pass it in


class OperationUpdateOut(Schema):
    name: str


class OperationUpdateIn(ModelSchema):
    operator_id: int
    # Converting types
    naics_code_id: int
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
    application_lead: Optional[int] = None
    is_application_lead_external: Optional[bool] = None

    class Config:
        model = Operation
        model_exclude = ["id"]  # need to exclude id since it's auto generated and we don't want to pass it in


class OperationOut(ModelSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    previous_year_attributable_emissions: Optional[str] = None
    swrs_facility_id: Optional[str] = None
    bcghg_id: Optional[str] = None
    current_year_estimated_emissions: Optional[str] = None
    opt_in: Optional[bool] = None
    verified_at: Optional[date] = None
    is_application_lead_external: Optional[bool] = None
    application_lead: Optional[ContactSchema]

    class Config:
        model = Operation
        model_fields = "__all__"
