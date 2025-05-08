from dataclasses import dataclass
from typing import Optional
from django.db import transaction
from reporting.models.report_version import ReportVersion
from reporting.models.report_change import ReportChange


@dataclass
class ReportChangeData:
    reason_for_change: str


class ReportChangeService:
    @staticmethod
    def get_report_change_by_version_id(
        report_version_id: int,
    ) -> Optional[ReportChange]:
        """
        Retrieve a ReportChange instance for a given report version ID.

        Args:
            report_version_id: The report version ID

        Returns:
            ReportChange instance
        """
        return ReportChange.objects.filter(report_version__id=report_version_id).first()

    @staticmethod
    @transaction.atomic
    def save_report_change(report_version_id: int, data: ReportChangeData) -> ReportChange:
        report_version = ReportVersion.objects.get(pk=report_version_id)
        report_change, created = ReportChange.objects.update_or_create(
            report_version=report_version,
            defaults={
                "reason_for_change": data.reason_for_change,
            },
        )
        return report_change
