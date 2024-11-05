from uuid import UUID
from reporting.models.report_activity import ReportActivity
from reporting.service.report_activity_serializers import ReportActivitySerializer


class ReportActivityLoadService:
    @classmethod
    def load(cls, report_version_id: int, facility_id: UUID, activity_id: int) -> dict:

        try:
            r = ReportActivity.objects.get(
                report_version_id=report_version_id, facility_report__facility_id=facility_id, activity_id=activity_id
            )
            return ReportActivitySerializer.serialize(r)
        except ReportActivity.DoesNotExist:
            return {}
