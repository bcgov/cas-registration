from django.db import transaction

from reporting.models import ReportVersion, FacilityReport
from registration.models import Facility, FacilityDesignatedOperationTimeline
from typing import List, Dict
from uuid import UUID


class ReportFacilitiesService:
    @staticmethod
    @transaction.atomic
    def get_report_facility_list_by_version_id(version_id: int) -> Dict[str, List[str]]:
        """
        Get facilities associated with a report version's operation.

        Args:
            version_id: The report version ID

        Returns:
            Dictionary containing list of facilities with their details
        """
        report_version = ReportVersion.objects.select_related('report__operation').get(id=version_id)

        # Retrieve distinct facilities associated with this report version's operation
        facilities_list = list(
            Facility.objects.filter(designated_operations__operation=report_version.report.operation)
            .values_list('name', flat=True)
            .distinct()
        )

        return {"facilities": facilities_list}

    @classmethod
    @transaction.atomic
    def save_selected_facilities(
        cls,
        version_id: int,
        facility_list: list[UUID],
    ) -> None:
        """
        Save selected facility to report version.

        Args:
            version_id: The report version ID
            facility_list: The facility UUIDs of the selected facilities
        """

        report_version = ReportVersion.objects.get(id=version_id)

        # Delete unselected facilities
        FacilityReport.objects.filter(report_version=report_version).exclude(facility_id__in=facility_list).delete()

        # Bulk create new facilities that are not already in Facility Report
        FacilityReport.objects.bulk_create(
            [
                FacilityReport(
                    report_version=report_version,
                    facility=facility,
                    facility_name=facility.name,
                    facility_type=facility.type,
                    facility_bcghgid=str(facility.bcghg_id.id) if facility.bcghg_id else None,
                )
                for facility in Facility.objects.filter(
                    id__in=set(facility_list)
                    - set(
                        FacilityReport.objects.filter(report_version=report_version).values_list(
                            'facility_id', flat=True
                        )
                    )
                )
            ]
        )

    @staticmethod
    @transaction.atomic
    def get_all_facilities_for_review(version_id: int) -> dict:
        selected_facilities = set(
            FacilityReport.objects.filter(report_version_id=version_id).values_list('facility_id', flat=True)
        )

        report_version = ReportVersion.objects.select_related('report__operation').get(id=version_id)

        available_facilities = (
            FacilityDesignatedOperationTimeline.objects.filter(operation_id=report_version.report.operation.id)
            .distinct()
            .values('facility_id', 'facility__name', 'end_date')
        )

        current_facilities: list = []
        past_facilities: list = []

        # Determine if all current facilities should be considered selected
        all_selected_for_current = not selected_facilities

        for facility in available_facilities:
            facility_data = {
                "facility_id": facility['facility_id'],
                "facility__name": facility['facility__name'],
            }

            if facility['end_date']:
                # Past facilities should only be selected if explicitly present in selected_facilities
                facility_data["is_selected"] = facility['facility_id'] in selected_facilities
                past_facilities.append(facility_data)
            else:
                # Apply 'all_selected' condition only for current facilities
                facility_data["is_selected"] = all_selected_for_current or (
                    facility['facility_id'] in selected_facilities
                )
                current_facilities.append(facility_data)

        return {
            "current_facilities": current_facilities,
            "past_facilities": past_facilities,
        }
