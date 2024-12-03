from typing import Optional

from ninja import ModelSchema
from pydantic import alias_generators

from reporting.models import ReportAdditionalData


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportAdditionalDataOut(ModelSchema):
    """
    Schema for the get report additional data endpoint request output
    """

    capture_emissions: Optional[bool] = False  # Default values
    emissions_on_site_use: Optional[int] = None
    emissions_on_site_sequestration: Optional[int] = None
    emissions_off_site_transfer: Optional[int] = None
    electricity_generated: Optional[int] = None

    class Meta:
        # alias_generator = to_snake
        model = ReportAdditionalData
        populate_by_name = True
        fields = [
            'capture_emissions',
            'emissions_on_site_use',
            'emissions_on_site_sequestration',
            'emissions_off_site_transfer',
            'electricity_generated',
        ]


class ReportAdditionalDataIn(ModelSchema):
    """
    Schema for the save report additional data endpoint request input.
    """

    report_version: int
    capture_emissions: bool
    emissions_on_site_use: Optional[int] = None
    emissions_on_site_sequestration: Optional[int] = None
    emissions_off_site_transfer: Optional[int] = None
    electricity_generated: Optional[int] = None

    class Meta:
        alias_generator = to_snake
        model = ReportAdditionalData
        fields = [
            'capture_emissions',
            'emissions_on_site_use',
            'emissions_on_site_sequestration',
            'emissions_off_site_transfer',
            'electricity_generated',
            'report_version',
        ]
