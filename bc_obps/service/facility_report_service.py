from uuid import UUID
from django.db import transaction
from typing import List, Optional, Tuple

from registration.models import Activity
from reporting.models.facility_report import FacilityReport
from reporting.schema.facility_report import FacilityReportIn


class FacilityReportService:
    @classmethod
    def get_facility_report_by_version_and_id(cls, report_version_id: int, facility_id: UUID) -> FacilityReport:
        return FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

    @classmethod
    def get_facility_report_by_version_id(cls, report_version_id: int) -> Optional[Tuple[UUID]]:
        # Return the first facility_id as a tuple or None
        facility_id = (
            FacilityReport.objects.filter(report_version__id=report_version_id)
            .values_list('facility_id', flat=True)
            .first()
        )
        return (facility_id,) if facility_id else None

    @classmethod
    def get_activity_ids_for_facility(cls, version_id: int, facility_id: UUID) -> List[int]:
        facility_report = FacilityReport.objects.get(report_version_id=version_id, facility_id=facility_id)
        return list(facility_report.activities.values_list('id', flat=True))

    @classmethod
    @transaction.atomic()
    def save_facility_report(
        cls, report_version_id: int, facility_id: UUID, data: FacilityReportIn, user_guid: UUID
    ) -> FacilityReport:
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
        facility_report.set_create_or_update(user_guid)

        return facility_report
