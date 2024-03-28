from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import BusinessStructure, AppRole, UserOperator
from registration.schema import BusinessStructureOut
from django.core.cache import cache


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut], url_name="list_business_structures")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_business_structures(request):
    cached_data = cache.get("business_structures")
    if cached_data:
        return cached_data
    else:
        business_structures = BusinessStructure.objects.only(*BusinessStructureOut.Meta.fields)
        cache.set("business_structures", business_structures, 60 * 60 * 24 * 1)  # 1 day
        return business_structures
