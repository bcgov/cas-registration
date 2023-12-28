from registration.utils import raise_401_if_role_not_authorized
from .api_base import router
from typing import List
from registration.models import BusinessStructure, AppRole
from registration.schema import BusinessStructureOut


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut])
def list_business_structures(request):
    raise_401_if_role_not_authorized(request, AppRole.get_all_eligible_roles())
    qs = BusinessStructure.objects.all()
    return qs
