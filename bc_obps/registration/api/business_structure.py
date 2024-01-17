from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import BusinessStructure, AppRole, UserOperator
from registration.schema import BusinessStructureOut


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut])
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_business_structures(request):
    qs = BusinessStructure.objects.all()
    return qs
