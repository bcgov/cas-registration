import json
from reporting.models import Configuration, ConfigurationElement
from typing import List, Dict, Any
from registration.models import Activity
from uuid import UUID
from service.utils.get_report_valid_date_from_version_id import get_report_valid_date_from_version_id


class ActivityService:
    @classmethod
    def get_initial_activity_data(cls, version_id: int, facility_id: UUID, activity_id: int) -> str:
        source_type_map: dict[int, str] = {}
        report_date = get_report_valid_date_from_version_id(version_id)
        config = Configuration.objects.get(valid_from__lte=report_date, valid_to__gte=report_date)
        source_type_data = (
            ConfigurationElement.objects.select_related('source_type')
            .filter(activity_id=activity_id, valid_from__lte=config, valid_to__gte=config)
            .order_by('source_type__id')
            .distinct('source_type__id')
            .only('source_type__id', 'source_type__json_key')
        )
        for s in source_type_data:
            source_type_map[s.source_type.id] = s.source_type.json_key
        return json.dumps({"activityId": activity_id, "sourceTypeMap": source_type_map})

    @classmethod
    def get_all_activities(cls) -> List[Dict[str, Any]]:
        # Fetch activities and sort by weight
        activities = Activity.objects.all().order_by('weight', 'name').values("id", "name", "applicable_to")
        return [dict(activity) for activity in activities]

    @classmethod
    def get_all_activity_ids(cls) -> List[int]:
        # Fetch activities and sort by weight
        return list(Activity.objects.all().values_list("id", flat=True).order_by("weight", "name"))
