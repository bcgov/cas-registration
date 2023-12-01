from .api_base import router
from typing import List
from registration.models import NaicsCode, User
from registration.schema import (
    NaicsCodeSchema,
)
from registration.utils import check_if_role_authorized

##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    status, message = check_if_role_authorized(request.current_user.app_role, ["industry_user", "industry_user_admin"])
    if status != 200:
        return status, message
    qs = NaicsCode.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
