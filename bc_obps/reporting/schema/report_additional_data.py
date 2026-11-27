from typing import Optional

from ninja import ModelSchema
from pydantic import alias_generators
from reporting.models import ReportAdditionalData


class ReportAdditionalDataOut(ModelSchema):
    class Meta:
        alias_generator = alias_generators.to_snake
        model = ReportAdditionalData
        fields = [
            "capture_emissions",
            "emissions_on_site_use",
            "emissions_on_site_sequestration",
            "emissions_off_site_transfer",
            "electricity_generated",
        ]


class ReportAdditionalDataIn(ModelSchema):
    """
    Schema for the save report additional data endpoint request input.
    """

    report_version: int
    capture_emissions: bool
    emissions_on_site_use: int | None = None
    emissions_on_site_sequestration: int | None = None
    emissions_off_site_transfer: int | None = None
    electricity_generated: int | None = None

    class Meta:
        alias_generator = alias_generators.to_snake
        model = ReportAdditionalData
        fields = [
            "capture_emissions",
            "emissions_on_site_use",
            "emissions_on_site_sequestration",
            "emissions_off_site_transfer",
            "electricity_generated",
            "report_version",
        ]
