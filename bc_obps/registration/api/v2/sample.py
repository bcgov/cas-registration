from service.data_access_service.naics_code_service import NaicsCodeDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List
from registration.models import AppRole, UserOperator
from registration.schema import NaicsCodeSchema

##### GET #####


@router.get("/v2/naics_codes", response=List[NaicsCodeSchema], url_name="list_naics_codes_v2", tags=["V2"])
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_naics_codes_v2(request):
    return 200, NaicsCodeDataAccessService.get_naics_codes()
