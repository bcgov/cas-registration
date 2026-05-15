from typing import List, Optional
from ninja import ModelSchema, Schema, Field
from common.exceptions import UserError
from reporting.models import ReportNonAttributableEmissions
from pydantic import alias_generators, field_validator, model_validator, ValidationInfo


class ReportNonAttributableActivityOut(ModelSchema):
    """
    Schema for a single non-attributable emission activity.
    """

    emission_category: str = Field(..., alias="emission_category.category_name")
    gas_type: List[str]

    class Meta:
        alias_generator = alias_generators.to_snake
        model = ReportNonAttributableEmissions
        fields = ['id', 'activity', 'source_type']

    @staticmethod
    def resolve_gas_type(obj: ReportNonAttributableEmissions) -> List[str]:
        return list(obj.gas_type.values_list('chemical_formula', flat=True))


class ReportNonAttributableOut(Schema):
    """
    Schema for the non-attributable emissions endpoint response.
    """

    emissions_exceeded: bool
    activities: List[ReportNonAttributableActivityOut]


class ReportNonAttributableIn(ModelSchema):
    """
    Schema for the save report operation endpoint request input
    """

    id: Optional[int] = Field(None)
    emission_category: str
    gas_type: List[str] = Field(min_length=1)

    class Meta:
        alias_generator = alias_generators.to_snake
        model = ReportNonAttributableEmissions
        fields = ['id', 'activity', 'source_type']


class ReportNonAttributableSchema(Schema):
    """
    Schema for the payload of the "save report" operation.
    """

    emissions_exceeded: bool = Field(..., description="Indicates if emissions exceeded the threshold.")
    activities: List[ReportNonAttributableIn] = Field(default=[], description="List of activities in the report.")

    @field_validator("activities", mode="before")
    @classmethod
    def clear_activities_when_not_exceeded(cls, v: list, info: ValidationInfo) -> list:
        if not info.data.get("emissions_exceeded"):
            return []
        return v

    @model_validator(mode="after")
    def activities_required_when_emissions_exceeded(self) -> "ReportNonAttributableSchema":
        if self.emissions_exceeded and not self.activities:
            raise UserError("At least one activity is required when emissions are exceeded.")
        return self
