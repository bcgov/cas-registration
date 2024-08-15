import json
from reporting.models import Configuration, ConfigurationElement
from registration.models import ReportingActivity
from typing import List, Dict, Any


class ActivityService:
    @classmethod
    def get_initial_activity_data(request, activity_name: str, report_date: str) -> str:
        if report_date is None:
            raise Exception('Cannot fetch activity data without a valid report date')
        if activity_name is None:
            raise Exception('Cannot fetch activity data without activity name')
        # Get
        source_type_map: dict[int, str] = {}
        activity_id = ReportingActivity.objects.get(name=activity_name).id
        config = Configuration.objects.get(valid_from__lte=report_date, valid_to__gte=report_date)
        source_type_data = (
            ConfigurationElement.objects.select_related('source_type')
            .filter(reporting_activity_id=activity_id, valid_from__lte=config, valid_to__gte=config)
            .order_by('source_type__id')
            .distinct('source_type__id')
            .only('source_type__id', 'source_type__json_key')
        )
        for s in source_type_data:
            source_type_map[s.source_type.id] = s.source_type.json_key
        return json.dumps({"activityId": activity_id, "sourceTypeMap": source_type_map})

    @classmethod
    def get_all_activities(cls) -> List[Dict[str, Any]]:
        activities = ReportingActivity.objects.all().values('id', 'name', 'applicable_to')
        return list(activities)
