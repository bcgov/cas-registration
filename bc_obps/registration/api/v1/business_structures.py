from django.http import HttpRequest
from django.db.models import QuerySet
from registration.constants import BUSINESS_STRUCTURE_TAGS
from service.data_access_service.business_structure_service import BusinessStructureDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import AppRole, BusinessStructure, UserOperator
from registration.schema.v1 import BusinessStructureOut


##### GET #####
@router.get(
    "/business_structures",
    response=List[BusinessStructureOut],
    url_name="list_business_structures",
    tags=BUSINESS_STRUCTURE_TAGS,
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_business_structures(request: HttpRequest) -> Tuple[Literal[200], QuerySet[BusinessStructure]]:
    return 200, BusinessStructureDataAccessService.get_business_structures()
