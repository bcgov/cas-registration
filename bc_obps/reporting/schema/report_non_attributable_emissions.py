from ninja import ModelSchema

from reporting.models import ReportNonAttributableEmissions
from pydantic import alias_generators
from typing import List


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
        fields = ['activity', 'source_type', 'emission_category', 'gas_type']


class ReportNonAttributableIn(ModelSchema):
    """
    Schema for the save report operation endpoint request input
    """

    activity: str
    source_type: str
    emission_category: str
    gas_type: List[int]

    class Meta:
        alias_generator = to_snake
        model = ReportNonAttributableEmissions
        fields = [
            'activity',
            'source_type',
            'emission_category',
            'gas_type',
        ]
