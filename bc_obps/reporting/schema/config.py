from datetime import datetime
from typing import List, Optional
from ninja import Field, FilterSchema, ModelSchema, Schema
from reporting.models import ReportingSourceType, ReportingGasType, ReportingMethodology, ConfigurationElement
from registration.models import ReportingActivity
from bc_obps.settings import ENVIRONMENT

class ConfigOut(ModelSchema):
    reporting_activity_name: Optional[str] = Field(None, alias="reporting_activity.name")
    reporting_source_type_name: Optional[str] = Field(None, alias="reporting_source_type.name")
    reporting_gas_type_name: Optional[str] = Field(None, alias="reporting_gas_type.name")
    reporting_methodology_name: Optional[str] = Field(None, alias="reporting_methodology.name")
    class Config:
        model = ConfigurationElement
        model_exclude = ["valid_to", "valid_from", "id"]
