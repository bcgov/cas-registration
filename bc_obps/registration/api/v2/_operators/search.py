from typing import List, Literal, Optional, Tuple, Union
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATOR_TAGS
from service.operator_service import OperatorService
from registration.models import Operator
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.v2.operator import OperatorSearchOut
from registration.schema.generic import Message
from django.db.models import QuerySet
from registration.api.router import router

##### GET #####


@router.get(
    "/operators/search",
    response={200: Union[List[OperatorSearchOut], OperatorSearchOut], custom_codes_4xx: Message},
    tags=OPERATOR_TAGS,
    description="""Retrieves operator(s) based on the provided CRA business number or legal name.
    This endpoint is accessible to both approved and unapproved users, allowing them to view operator information when selected.
    If no matching operator is found, an exception is raised.""",
    auth=authorize("authorized_roles"),
)
def get_operators_by_cra_number_or_legal_name(
    request: HttpRequest, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
) -> Tuple[Literal[200], Union[Operator, QuerySet[Operator], OperatorSearchOut, List[OperatorSearchOut]]]:
    return 200, OperatorService.get_operators_by_cra_number_or_legal_name(cra_business_number, legal_name)
