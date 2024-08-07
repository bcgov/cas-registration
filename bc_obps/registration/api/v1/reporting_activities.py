from django.http import HttpRequest
from registration.constants import REPORTING_ACTIVITY_TAGS
from service.data_access_service.reporting_activity_service import ReportingActivityDataAccessService
from common.permissions import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import ReportingActivity
from registration.schema.v1 import (
    ReportingActivitySchema,
)
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/reporting_activities",
    response=List[ReportingActivitySchema],
    tags=REPORTING_ACTIVITY_TAGS,
    description="""Retrieves a list of reporting activities.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def list_reporting_activities(request: HttpRequest) -> Tuple[Literal[200], QuerySet[ReportingActivity]]:
    return 200, ReportingActivityDataAccessService.get_reporting_activities()
