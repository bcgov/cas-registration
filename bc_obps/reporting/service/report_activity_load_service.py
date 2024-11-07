from uuid import UUID
from reporting.models.report_activity import ReportActivity
from reporting.service.report_activity_serializers import ReportActivitySerializer


class ReportActivityLoadService:
    @classmethod
    def load(cls, report_version_id: int, facility_id: UUID, activity_id: int) -> dict:
        """
        Loads the report activity data from the database structure into a json dictionary.
        If the ReportActivity record is not found, it means this is the first load of the
        form and we can safely return an empty object.
        """
        try:
            r = ReportActivity.objects.prefetch_related(
                "facility_report",
                "reportsourcetype_records",
                "reportsourcetype_records__reportunit_records",
                "reportsourcetype_records__reportfuel_records",
                "reportsourcetype_records__reportemission_records",
                "reportsourcetype_records__reportemission_records__report_methodology",
                "reportsourcetype_records__reportunit_records__reportfuel_records",
                "reportsourcetype_records__reportunit_records__reportfuel_records__reportemission_records",
                "reportsourcetype_records__reportunit_records__reportfuel_records__reportemission_records__report_methodology",
            ).get(
                report_version_id=report_version_id, facility_report__facility_id=facility_id, activity_id=activity_id
            )
            return ReportActivitySerializer.serialize(r)
        except ReportActivity.DoesNotExist:
            return {}
