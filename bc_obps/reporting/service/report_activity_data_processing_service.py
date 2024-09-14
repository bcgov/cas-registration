from reporting.models.report_activity import ReportActivity
from reporting.models.report_source_type import ReportSourceType
from reporting.models.source_type import SourceType


class ReportActivityProcessingService:
    """
    Deserializer object that takes in a large JSON object representing data for one activity
    And deserializes it into ReportSourceType/ReportFuel/ReportUnit/ReportEmission ... as necessary
    """

    @classmethod
    def process(report_version_id: int, facility_id: int, activity_id: int, data: dict):

        # All data except the 'source_type' key
        activity_data = {key: data[key] for key in data if key not in ['source_type', 'id']}

        # Only one ReportActivity record per report_version/faciltiy/activity should ever exist
        existing_report_activity = ReportActivity.objects.first(
            report_version=report_version_id, facility_report__facility=facility_id, activity=activity_id
        )
        if existing_report_activity is not None:
            existing_report_activity.json_data = activity_data
            existing_report_activity.save()

        for source_type_key in data['source_types']:
            source_type = SourceType.objects.get(json_key=source_type_key)
            source_type_data = data['source_types'][source_type_key]

            # Only one ReportSourceType record per report_version/facility/activity/source_type should exist
            existing_report_source_type = ReportSourceType.objects.first()
