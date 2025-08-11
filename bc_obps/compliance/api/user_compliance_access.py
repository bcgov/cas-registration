from .router import router
from django.http import HttpRequest
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE

from ninja import Query
from common.api.utils import get_current_user_guid
from typing import Optional
from compliance.schema.user_compliance_access import UserStatusResponse
from compliance.service.user_compliance_access_service import UserComplianceAccessService


@router.get(
    "/user-compliance-access-status",
    response={200: UserStatusResponse, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Determine the current user's access status to the compliance application and/or a specific compliance report version.",
    auth=authorize("approved_authorized_roles"),
)
def get_user_compliance_access_status(
    request: HttpRequest,
    compliance_report_version_id: Optional[str] = Query(
        None, description="Optional ID of the compliance report version requested"
    ),
) -> dict:
    # Normalize the report version ID, if provided
    if (
        compliance_report_version_id
        and str(compliance_report_version_id).lower() not in ["null", "undefined"]
        and str(compliance_report_version_id).isdigit()
    ):
        compliance_report_version_id_int = int(compliance_report_version_id)
    else:
        compliance_report_version_id_int = None

    # Get the compliance access status using the service layer
    user_guid = get_current_user_guid(request)
    status = UserComplianceAccessService.determine_user_compliance_status(
        user_guid,
        compliance_report_version_id_int,
    )
    return {"status": status}
