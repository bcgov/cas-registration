from typing import List
from django.http import HttpRequest
from registration.models.app_role import AppRole
from registration.models.registration_purpose import RegistrationPurpose
from registration.models import UserOperator
from registration.decorators import authorize, handle_http_errors
from registration.api.router import router
from typing import Literal, Tuple


from registration.schema.generic import Message
from ninja.responses import codes_4xx

##### GET #####


@router.get("/registration_purposes", response={200: List[str], codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_registration_purposes(request: HttpRequest) -> Tuple[Literal[200], List[str]]:
    purposes = [purpose.value for purpose in RegistrationPurpose.Purposes]
    return 200, purposes
