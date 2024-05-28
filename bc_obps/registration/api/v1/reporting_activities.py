from django.http import HttpRequest
from registration.constants import REPORTING_ACTIVITY_TAGS
from service.data_access_service.reporting_activity_service import ReportingActivityDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import AppRole, ReportingActivity, UserOperator
from registration.schema.v1 import (
    ReportingActivitySchema,
)
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/reporting_activities",
    response=List[ReportingActivitySchema],
    url_name="list_reporting_activities",
    tags=REPORTING_ACTIVITY_TAGS,
    description="""Retrieves a list of reporting activities.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_reporting_activities(request: HttpRequest) -> Tuple[Literal[200], QuerySet[ReportingActivity]]:
    return 200, ReportingActivityDataAccessService.get_reporting_activities()
