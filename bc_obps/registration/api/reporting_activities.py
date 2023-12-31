from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import AppRole, ReportingActivity
from registration.schema import (
    ReportingActivitySchema,
)

##### GET #####


@router.get("/reporting_activities", response=List[ReportingActivitySchema])
@authorize(AppRole.get_all_authorized_roles())
def list_reporting_activities(request):
    qs = ReportingActivity.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
