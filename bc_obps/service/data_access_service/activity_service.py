from typing import Optional
from registration.models import Activity
from registration.schema.v1 import (
    ActivitySchema,
)
from django.core.cache import cache
from django.db.models import QuerySet


class ActivityDataAccessService:
    @classmethod
    def get_activities(cls) -> QuerySet[Activity]:
        cached_data: Optional[QuerySet[Activity]] = cache.get("activities")
        if cached_data:
            return cached_data
        else:
            activities = Activity.objects.only(*ActivitySchema.Config.model_fields)
            cache.set("activities", activities, 60 * 60 * 24 * 1)
            return activities
