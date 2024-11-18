from reporting.models import ReportVersion
from registration.models import Facility
from django.db import transaction
from typing import List, Dict

class ReportFacilitiesService:
    @staticmethod
    def get_report_facility_list_by_version_id(version_id: int) -> Dict[str, List[str]]:
        """
        Get facilities associated with a report version's operation.

        Args:
            version_id: The report version ID

        Returns:
            Dictionary containing list of facilities with their details

        Raises:
            ObjectDoesNotExist: If the report version or operation is not found
            ValidationError: For other unexpected errors
        """   
        # Fetch the operation using select_related for efficiency
        report_version = ReportVersion.objects.select_related(
            'report__operation'
        ).get(id=version_id)

        operation = report_version.report.operation

        # Retrieve distinct facilities associated with this operation
        facilities_list = list(
            Facility.objects.filter(
                designated_operations__operation=operation
            ).values_list('name', flat=True).distinct()
        )

        return {"facilities": facilities_list}

