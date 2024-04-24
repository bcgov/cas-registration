from service.data_access_service.business_structure_service import BusinessStructureDataAccessService
from registration.decorators import authorize
from .api_base import router
from typing import List
from registration.models import AppRole, UserOperator
from registration.schema import BusinessStructureOut


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut], url_name="list_business_structures")
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_business_structures(request):
    return 200, BusinessStructureDataAccessService.get_business_structures()
