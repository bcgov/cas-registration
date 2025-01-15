from django.db import transaction
from reporting.models.report_selected_facility import ReportSelectedFacility
from reporting.models import ReportVersion
from registration.models import Facility
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
        facility_list: List[UUID],
        user_guid: UUID,
        ) -> None:
        """
        Save selected facility to report version.

        Args:
            version_id: The report version ID
            facility_list: The facility IDs of the selected facilities
            user_guid: The user GUID of the user making the save request


        """
        
        # Delete existing selected facilities that are no longer selected
        ReportSelectedFacility.objects.filter(report_version_id=version_id).exclude(facility_id__in=facility_list).delete()

        for facility_id in facility_list:
            selected_facility_record, created = ReportSelectedFacility.objects.get_or_create(
                report_version_id=version_id,
                facility_id=facility_id,
            )
            if created:
                selected_facility_record.set_create_or_update(user_guid)

    @staticmethod
    @transaction.atomic
    def get_selected_facilities(
        version_id: int,
        ) -> List[UUID]:
        """
        Get selected facilities for a report version.

        Args:
            version_id: The report version ID

        Returns:
            List of facility IDs
        """
        return list(ReportSelectedFacility.objects.filter(report_version_id=version_id).values_list('facility_id', flat=True))
    
    
