from .api_base import router
from typing import List
from registration.models import BusinessStructure
from registration.schema import BusinessStructureOut


##### GET #####
@router.get("/business_structures", response=List[BusinessStructureOut])
def list_business_structures(request):
    qs = BusinessStructure.objects.all()
    return qs
