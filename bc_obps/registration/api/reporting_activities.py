from django.http import HttpRequest
from registration.constants import ACTIVITY_TAGS
from service.data_access_service.activity_service import ActivityDataAccessService
from common.permissions import authorize
from registration.api.router import router
from typing import List, Literal, Tuple
from registration.models import Activity
from registration.schema import ActivitySchemaOut
from django.db.models import QuerySet

##### GET #####


@router.get(
    "/reporting_activities",
    response=List[ActivitySchemaOut],
    tags=ACTIVITY_TAGS,
    description="""Retrieves a list of reporting activities.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def list_reporting_activities(request: HttpRequest) -> Tuple[Literal[200], QuerySet[Activity]]:
    return 200, ActivityDataAccessService.get_activities()
