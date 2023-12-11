from registration.utils import raise_401_if_role_not_authorized
from .api_base import router
from typing import List
from registration.models import BusinessStructure
from registration.schema import BusinessStructureOut


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut])
def list_business_structures(request):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])
    qs = BusinessStructure.objects.all()
    return qs
