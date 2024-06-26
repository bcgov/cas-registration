from typing import Optional
from registration.models import ReportingActivity
from registration.schema.v1 import (
    ReportingActivitySchema,
)
from django.core.cache import cache
from django.db.models import QuerySet


class ReportingActivityDataAccessService:
    @classmethod
    def get_reporting_activities(cls) -> QuerySet[ReportingActivity]:
        cached_data: Optional[QuerySet[ReportingActivity]] = cache.get("reporting_activities")
        if cached_data:
            return cached_data
        else:
            reporting_activities = ReportingActivity.objects.only(*ReportingActivitySchema.Config.model_fields)
            cache.set("reporting_activities", reporting_activities, 60 * 60 * 24 * 1)
            return reporting_activities
