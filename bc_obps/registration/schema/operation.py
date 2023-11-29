from typing import Optional
from ninja import Field
from ninja import ModelSchema
from registration.models import Operation, Contact
from datetime import date
from .contact import ContactSchema


#### Operation schemas
class OperationIn(ModelSchema):
    # temporarily setting a default operator since we don't have login yet
    operator_id: int = 1
    # Converting types
    naics_code_id: int
    verified_at: Optional[date] = None
    # al => application lead
    al_first_name: Optional[str] = None
    al_last_name: Optional[str] = None
    al_position_title: Optional[str] = None
    al_street_address: Optional[str] = None
    al_municipality: Optional[str] = None
    al_province: Optional[str] = None
    al_postal_code: Optional[str] = None
    al_email: Optional[str] = None
    al_phone_number: Optional[str] = None
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
