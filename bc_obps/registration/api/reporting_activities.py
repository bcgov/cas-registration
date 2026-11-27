from typing import List, Literal, Tuple

from common.permissions import authorize
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import ACTIVITY_TAGS
from registration.models import Activity
from registration.schema import ActivitySchemaOut
from registration.service.data_access_service.activity_service import (
    ActivityDataAccessService,
)

##### GET #####


@router.get(
    "/reporting_activities",
    response=list[ActivitySchemaOut],
    tags=ACTIVITY_TAGS,
    description="""Retrieves a list of reporting activities.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def list_reporting_activities(
    request: HttpRequest,
) -> tuple[Literal[200], QuerySet[Activity]]:
    return 200, ActivityDataAccessService.get_activities()
