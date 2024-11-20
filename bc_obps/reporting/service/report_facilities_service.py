from django.db import transaction
from reporting.models import ReportVersion
from registration.models import Facility
from typing import List, Dict


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
