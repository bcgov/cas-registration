from dataclasses import asdict, dataclass

from reporting.models.report_additional_data import ReportAdditionalData
from reporting.models.report_version import ReportVersion


@dataclass
class ReportAdditionalDataPayload:
    capture_emissions: bool = False
    emissions_on_site_use: int | None = None
    emissions_on_site_sequestration: int | None = None
    emissions_off_site_transfer: int | None = None
    electricity_generated: int | None = None


def build_report_additional_data_payload(
    *,
    capture_emissions: bool = False,
    emissions_on_site_use: int | None = None,
    emissions_on_site_sequestration: int | None = None,
    emissions_off_site_transfer: int | None = None,
    electricity_generated: int | None = None,
) -> dict:
    return asdict(
        ReportAdditionalDataPayload(
            capture_emissions=capture_emissions,
            emissions_on_site_use=emissions_on_site_use,
            emissions_on_site_sequestration=emissions_on_site_sequestration,
            emissions_off_site_transfer=emissions_off_site_transfer,
            electricity_generated=electricity_generated,
        )
    )


def create_report_additional_data(
    report_version: ReportVersion,
) -> ReportAdditionalData:
    payload = build_report_additional_data_payload(
        capture_emissions=True,
        emissions_on_site_use=100,
        emissions_on_site_sequestration=200,
        emissions_off_site_transfer=300,
        electricity_generated=500,
    )

    return ReportAdditionalData.objects.create(
        report_version=report_version,
        **payload,
    )
