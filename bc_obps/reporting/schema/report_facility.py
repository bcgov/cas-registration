from ninja import ModelSchema

from reporting.models.report_facility import ReportFacility
from pydantic import alias_generators
from typing import List


def to_camel(string: str) -> str:
    return alias_generators.to_camel(string)


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportFacilityOut(ModelSchema):
    """
    Schema for the get report facility endpoint request output
    """

    class Meta:
        alias_generator = to_snake
        model = ReportFacility
        fields = [
            'facility_name',
            'facility_type',
            'facility_bcghgid',
            'activities',
            'products'
        ]


class ReportFacilityIn(ModelSchema):
    """
    Schema for the save report activity endpoint request input
    """

    facility_name: str
    facility_type: str
    facility_bcghgid: str
    activities: List[str]
    products: List[str]

    class Meta:
        alias_generator = to_snake
        model = ReportFacility
        fields = [
            'facility_name',
            'facility_type',
            'facility_bcghgid',
            'activities',
            'products'
        ]
