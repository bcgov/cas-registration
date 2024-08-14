from typing import List
from django.http import HttpRequest
from registration.models.registration_purpose import RegistrationPurpose
from registration.decorators import handle_http_errors
from registration.api.router import router
from typing import Literal, Tuple
from common.permissions import authorize


from registration.schema.generic import Message
from ninja.responses import codes_4xx

##### GET #####


@router.get(
    "/registration_purposes", response={200: List[str], codes_4xx: Message}, auth=authorize("approved_authorized_roles")
)
@handle_http_errors()
def get_registration_purposes(request: HttpRequest) -> Tuple[Literal[200], List[str]]:
    purposes = [purpose.value for purpose in RegistrationPurpose.Purposes]
    return 200, purposes
