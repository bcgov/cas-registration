from typing import Literal, Union

from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATOR_TAGS
from registration.models import Operator
from registration.schema import Message, OperatorSearchOut
from registration.service.operator_service import OperatorService

##### GET #####


@router.get(
    "/operators/search",
    response={
        200: list[OperatorSearchOut] | OperatorSearchOut,
        custom_codes_4xx: Message,
    },
    tags=OPERATOR_TAGS,
    description="""Retrieves operator(s) based on the provided CRA business number or legal name.
    This endpoint is accessible to both approved and unapproved users, allowing them to view operator information when selected.
    If no matching operator is found, an exception is raised.""",
    auth=authorize("authorized_roles"),
)
def get_operators_by_cra_number_or_legal_name(
    request: HttpRequest,
    cra_business_number: str | None = None,
    legal_name: str | None = "",
) -> tuple[
    Literal[200],
    Operator | QuerySet[Operator] | OperatorSearchOut | list[OperatorSearchOut],
]:
    return 200, OperatorService.get_operators_by_cra_number_or_legal_name(
        cra_business_number, legal_name
    )
