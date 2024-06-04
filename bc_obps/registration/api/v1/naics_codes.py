from django.http import HttpRequest
from django.db.models import QuerySet
from registration.constants import NAICS_CODE_TAGS
from service.data_access_service.naics_code_service import NaicsCodeDataAccessService
from registration.decorators import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import AppRole, NaicsCode, UserOperator
from registration.schema.v1 import NaicsCodeSchema

##### GET #####


@router.get(
    "/naics_codes",
    response=List[NaicsCodeSchema],
    tags=NAICS_CODE_TAGS,
    description="""Retrieves a list of NAICS codes.
    The endpoint returns cached data if available; otherwise, it queries the database and caches the results for future requests.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
def list_naics_codes(request: HttpRequest) -> Tuple[Literal[200], QuerySet[NaicsCode]]:
    return 200, NaicsCodeDataAccessService.get_naics_codes()
