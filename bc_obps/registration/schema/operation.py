from typing import Optional
from ninja import Field
from ninja import ModelSchema
from registration.models import Operation
from datetime import date


#### Operation schemas
class OperationIn(ModelSchema):
    # temporarily setting a default operator since we don't have login yet
    operator_id: int = 1
    # Converting types
    naics_code_id: int
    verified_at: Optional[date] = None

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

    class Config:
        model = Operation
        model_fields = "__all__"
