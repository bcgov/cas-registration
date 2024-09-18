from uuid import UUID
from django.db import transaction
from typing import List, Optional

from registration.models import Activity
from reporting.models.facility_report import FacilityReport
from reporting.schema.facility_report import FacilityReportIn, FacilityReportOut


class FacilityReportService:
    @classmethod
    def get_facility_report_by_version_and_id(
        cls, report_version_id: int, facility_id: UUID
    ) -> Optional[FacilityReport]:
        return FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

    @classmethod
    def get_activity_ids_for_facility(cls, version_id: int, facility_id: UUID) -> List[int]:
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)
        return list(facility_report.activities.values_list('id', flat=True))

    @classmethod
    def get_facility_report_form_data(
        cls, facility_report: FacilityReport | None, activity_ids: List[int]
    ) -> Optional[FacilityReportOut]:
        if facility_report:
            return FacilityReportOut(
                id=facility_report.id,
                report_version_id=facility_report.report_version.id,
                facility_name=facility_report.facility_name,
                facility_type=facility_report.facility_type,
                facility_bcghgid=facility_report.facility_bcghgid,
                activities=activity_ids,
                products=[],
            )
        else:
            return None

    @classmethod
    @transaction.atomic()
    def save_facility_report(cls, report_version_id: int, facility_id: UUID, data: FacilityReportIn) -> FacilityReport:
        """
        Update a facility report and its related activities.

        Args:
            report_version_id (int): The ID of the report version.
            facility_id (int): The ID of the facility.
            data (FacilityReportIn): The input data for the facility report.

        Returns:
            FacilityReport: The updated or created FacilityReport instance.
        """
        # Update FacilityReport instance
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)
        facility_report.facility_name = data.facility_name.strip()
        facility_report.facility_type = data.facility_type.strip()

        # Update ManyToMany fields (activities)
        if data.activities:
            facility_report.activities.set(Activity.objects.filter(id__in=data.activities))

        # Save the updated FacilityReport instance
        facility_report.save()

        return facility_report
