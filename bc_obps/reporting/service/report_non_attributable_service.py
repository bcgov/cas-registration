from typing import List
from uuid import UUID

from reporting.models import ReportNonAttributableEmissions, EmissionCategory, ReportVersion, FacilityReport

from reporting.schema.report_non_attributable_emissions import ReportNonAttributableIn


class ReportNonAttributableService:
    @classmethod
    def get_report_non_attributable_by_version_id(
        cls, report_version_id: int, facility_id: UUID
    ) -> List[ReportNonAttributableEmissions]:
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)
        return list(ReportNonAttributableEmissions.objects.filter(facility_report=facility_report))

    @classmethod
    def save_report_non_attributable_emissions(
        cls, version_id: int, facility_id: UUID, data: List[ReportNonAttributableIn]
    ) -> List[ReportNonAttributableEmissions]:
        report_version = ReportVersion.objects.get(pk=version_id)
        facility_report = FacilityReport.objects.get(report_version=report_version, facility_id=facility_id)

        # Prepare a list of incoming activity IDs from the payload
        incoming_ids = [item.id for item in data if item.id]  # Access attributes directly

        # Delete any existing records that are not in the incoming data list
        ReportNonAttributableEmissions.objects.filter(
            report_version=report_version, facility_report=facility_report
        ).exclude(id__in=incoming_ids).delete()

        non_attributable_emissions = []

        for activity_data in data:
            # Access attributes directly from the object
            emission_category_name = activity_data.emission_category
            emission_category = EmissionCategory.objects.get(category_name=emission_category_name)

            # Using the object attributes instead of .get()
            report_non_attributable, created = ReportNonAttributableEmissions.objects.update_or_create(
                id=activity_data.id,
                defaults={
                    "report_version": report_version,
                    "facility_report": facility_report,
                    "activity": activity_data.activity,
                    "source_type": activity_data.source_type,
                    "emission_category": emission_category,
                },
            )

            non_attributable_emissions.append(report_non_attributable)

        return non_attributable_emissions

    @classmethod
    def delete_existing_reports(cls, version_id: int, facility_id: UUID) -> None:
        """
        Deletes existing reports from the database for the given report_version and facility_id.
        """
        # Get the report version and facility report to identify the records to delete
        report_version = ReportVersion.objects.get(pk=version_id)
        facility_report = FacilityReport.objects.get(report_version=report_version, facility_id=facility_id)

        # Delete the reports related to this version and facility
        ReportNonAttributableEmissions.objects.filter(
            report_version_id=report_version, facility_report_id=facility_report
        ).delete()
