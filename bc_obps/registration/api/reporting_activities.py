from .api_base import router
from typing import List
from registration.models import ReportingActivity
from registration.schema import (
    ReportingActivitySchema,
)

##### GET #####


@router.get("/reporting_activities", response=List[ReportingActivitySchema])
def list_reporting_activities(request):
    qs = ReportingActivity.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
