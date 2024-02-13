from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import NaicsCode, AppRole, UserOperator
from registration.schema import NaicsCodeSchema
from django.core.cache import cache

##### GET #####


@router.get("/naics_codes", response=List[NaicsCodeSchema], url_name="list_naics_codes")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_naics_codes(request):
    cached_data = cache.get("naics_codes")
    if cached_data:
        return cached_data
    else:
        naics_codes = NaicsCode.objects.only(*NaicsCodeSchema.Config.model_fields)
        cache.set("naics_codes", naics_codes, 60 * 60 * 24 * 1)  # 1 day
        return naics_codes


##### POST #####


##### PUT #####


##### DELETE #####
