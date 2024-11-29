from django.http import HttpRequest
from django.db.models import QuerySet
from registration.constants import NAICS_CODE_TAGS
from service.data_access_service.naics_code_service import NaicsCodeDataAccessService
from common.permissions import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import NaicsCode
from registration.schema.v1 import NaicsCodeSchema

##### GET #####


@router.get(
    "/naics_codes",
    response=List[NaicsCodeSchema],
    tags=NAICS_CODE_TAGS,
    description="""Retrieves a list of NAICS codes.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
    auth=authorize("authorized_roles"),
)
def list_naics_codes(request: HttpRequest) -> Tuple[Literal[200], QuerySet[NaicsCode]]:
    return 200, NaicsCodeDataAccessService.get_naics_codes()
