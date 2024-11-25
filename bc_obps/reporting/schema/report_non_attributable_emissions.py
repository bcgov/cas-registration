from typing import List, Optional
from ninja import ModelSchema, Schema
from reporting.models import ReportNonAttributableEmissions
from pydantic import alias_generators
from pydantic import Field


def to_camel(string: str) -> str:
    return alias_generators.to_camel(string)


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportNonAttributableOut(ModelSchema):
    """
    Schema for the get report operation endpoint request output
    """

    class Meta:
        alias_generator = to_snake
        model = ReportNonAttributableEmissions
        fields = ['id', 'activity', 'source_type', 'emission_category', 'gas_type']


class ReportNonAttributableIn(ModelSchema):
    """
    Schema for the save report operation endpoint request input
    """

    id: Optional[int] = Field(None)
    activity: str
    source_type: str
    emission_category: str
    gas_type: List[str]

    class Meta:
        alias_generator = to_snake
        model = ReportNonAttributableEmissions
        fields = ['id', 'activity', 'source_type', 'emission_category', 'gas_type']


class ReportNonAttributableSchema(Schema):
    """
    Schema for the payload of the "save report" operation.
    """

    emissions_exceeded: bool = Field(..., description="Indicates if emissions exceeded the threshold.")
    activities: List[ReportNonAttributableIn] = Field(..., description="List of activities in the report.")
