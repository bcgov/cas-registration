from django.http import HttpRequest
from django.db.models import QuerySet
from registration.constants import BUSINESS_STRUCTURE_TAGS
from service.data_access_service.business_structure_service import BusinessStructureDataAccessService
from common.permissions import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import BusinessStructure
from registration.schema.v1 import BusinessStructureOut


##### GET #####
@router.get(
    "/v1/business_structures",
    response=List[BusinessStructureOut],
    tags=BUSINESS_STRUCTURE_TAGS,
    description="""Retrieves a list of business structures.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def v1_list_business_structures(request: HttpRequest) -> Tuple[Literal[200], QuerySet[BusinessStructure]]:
    return 200, BusinessStructureDataAccessService.get_business_structures()
