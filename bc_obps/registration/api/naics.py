from .api_base import router
from typing import List
from registration.models import NaicsCode, AppRole
from registration.schema import (
    NaicsCodeSchema,
)
from registration.utils import raise_401_if_role_not_authorized

##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    raise_401_if_role_not_authorized(request, AppRole.get_all_eligible_roles())
    qs = NaicsCode.objects.all()
    return qs


##### POST #####


##### PUT #####


##### DELETE #####
