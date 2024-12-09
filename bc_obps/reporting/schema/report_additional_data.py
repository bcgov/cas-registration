from typing import Optional, List

from ninja import ModelSchema, Schema
from pydantic import alias_generators

from reporting.models import ReportAdditionalData


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class CaptureEmissionSchema(Schema):
    """
    Schema for the captured emissions section.
    """

    capture_type: Optional[List[str]] = None
    capture_emissions: Optional[bool] = False
    emissions_on_site_use: Optional[int] = None
    emissions_on_site_sequestration: Optional[int] = None
    emissions_off_site_transfer: Optional[int] = None


class AdditionalDataSectionSchema(Schema):
    """
    Schema for additional data section
    """

    electricity_generated: Optional[int] = None


class ReportAdditionalDataOut(Schema):
    captured_emissions_section: Optional[CaptureEmissionSchema] = None
    additional_emissions_section: Optional[AdditionalDataSectionSchema] = None


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
