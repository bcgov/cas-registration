from registration.utils import raise_401_if_role_not_authorized
from .api_base import router
from typing import List
from registration.models import ReportingActivity
from registration.schema import (
    ReportingActivitySchema,
)

##### GET #####


@router.get("/reporting_activities", response=List[ReportingActivitySchema])
def list_reporting_activities(request):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])
    qs = ReportingActivity.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
