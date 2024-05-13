from service.data_access_service.reporting_activity_service import ReportingActivityDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List
from registration.models import AppRole, UserOperator
from registration.schema import (
    ReportingActivitySchema,
)

##### GET #####


@router.get("/reporting_activities", response=List[ReportingActivitySchema], url_name="list_reporting_activities")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_reporting_activities(request):
    return 200, ReportingActivityDataAccessService.get_reporting_activities()


##### POST #####


##### PUT #####


##### DELETE #####
