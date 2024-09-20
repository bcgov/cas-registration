import json
import uuid
from django.db import transaction
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_source_type import ReportSourceType
from reporting.models.source_type import SourceType


class ReportActivitySaveLoadService:
    """
    Service that handles a json objects coming from an activity form:
    - Splits out json data in, and saves individual parts into a ReportActivity object
    - With a report_version, a facility and an activity, fetches the report_activity and all its dependent data and returns json data for the form
    """

    @classmethod
    @transaction.atomic()
    def save(cls, report_version_id: int, facility_id: uuid.UUID, activity_id: int, data: dict) -> ReportActivity:
        print("~~~~~~~~~~~~~~~~~~~~~~")
        print(json.dumps(data, indent=4))
        print("~~~~~~~~~~~~~~~~~~~~~~")
        # Find the matching FacilityReport
        facility_report = FacilityReport.objects.select_related('report_version', 'report_version__report').get(
            report_version_id=report_version_id, facility_id=facility_id
        )

        # All data except the 'source_type' key
        activity_data = {key: data[key] for key in data if key not in ['source_type', 'id']}

        # Only one ReportActivity record per report_version/faciltiy/activity should ever exist

        report_activity = ReportActivity.objects.update_or_create(
            report_version_id=report_version_id,
            facility_report_id=facility_report.id,
            activity_id=activity_id,
            create_defaults={
                "json_data": activity_data,
                "activity_base_schema": ActivityJsonSchema.objects.get(
                    activity_id=activity_id,
                    valid_from__valid_from__lte=facility_report.report_version.report.created_at,
                    valid_to__valid_to__gte=facility_report.report_version.report.created_at,
                ),
            },
            defaults={"json_data": activity_data},
        )

        for source_type_key in data['sourceTypes']:
            source_type = SourceType.objects.get(json_key=source_type_key)
            source_type_data = data['sourceTypes'][source_type_key]

            # Only one ReportSourceType record per report_version/facility/activity/source_type should exist
            existing_report_source_type = ReportSourceType.objects.first()

        return report_activity

    def load():
        # Will be implemented as part of #345
        raise NotImplementedError()
