from django.db import transaction

from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission_allocation import (
    ReportEmissionAllocation,
)
from reporting.models.report_version import ReportVersion


@transaction.atomic()
def prepare_emission_allocation_for_submission(
    report_version: ReportVersion,
) -> None:
    """
    Create default report emission allocation records
    for all facility reports associated with the report version.
    """

    facility_reports = FacilityReport.objects.filter(
        report_version=report_version,
    )

    for facility_report in facility_reports:
        create_report_emission_allocation_for_facility_report(
            facility_report,
        )


def create_report_emission_allocation_for_facility_report(
    facility_report: FacilityReport,
    allocation_methodology: str = (ReportEmissionAllocation.AllocationMethodologyChoices.NOT_APPLICABLE),
    allocation_other_methodology_description: str | None = None,
) -> ReportEmissionAllocation:
    """
    Create a default report emission allocation record
    for a facility report if one does not already exist.
    """

    if (
        allocation_methodology == ReportEmissionAllocation.AllocationMethodologyChoices.OTHER
        and not allocation_other_methodology_description
    ):
        allocation_other_methodology_description = "Test allocation methodology"

    report_emission_allocation, _ = ReportEmissionAllocation.objects.get_or_create(
        report_version=facility_report.report_version,
        facility_report=facility_report,
        defaults={
            "allocation_methodology": allocation_methodology,
            "allocation_other_methodology_description": (allocation_other_methodology_description),
        },
    )

    return report_emission_allocation
