from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import NaicsCode, AppRole, UserOperator
from registration.schema import (
    NaicsCodeSchema,
)

##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema])
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
