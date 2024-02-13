from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import AppRole, ReportingActivity, UserOperator
from registration.schema import (
    ReportingActivitySchema,
)
from django.core.cache import cache

##### GET #####


@router.get("/reporting_activities", response=List[ReportingActivitySchema], url_name="list_reporting_activities")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_reporting_activities(request):
    cached_data = cache.get("reporting_activities")
    if cached_data:
        return cached_data
    else:
        reporting_activities = ReportingActivity.objects.only(*ReportingActivitySchema.Config.model_fields)
        cache.set("reporting_activities", reporting_activities, 60 * 60 * 24 * 1)
        return reporting_activities


##### POST #####


##### PUT #####


##### DELETE #####
