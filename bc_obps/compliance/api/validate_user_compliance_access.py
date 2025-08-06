
from .router import router
from django.http import HttpRequest
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE

from ninja import Query
from common.api.utils import get_current_user_guid
from typing import Optional
from compliance.schema.validate_compliance_user import UserStatusResponse
from compliance.service.user_compliance_access_status import UserComplianceAccessStatus


@router.get(
    "/validate-user-compliance-access",
    response={200: UserStatusResponse, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Validate whether the current user has access to the compliance application and/or a specific compliance report version.",
    auth=authorize("approved_industry_user"),
)
def validate_user_compliance_access(
    request: HttpRequest,
    compliance_report_version_id: Optional[str] = Query(
        None,
        description="Optional ID of the compliance report version to check access against"
    ),
) -> dict:
    # Extract the user's GUID from the session/auth token
    user_guid = get_current_user_guid(request)

    # Validate and normalize the report version ID, if provided
    if (
        compliance_report_version_id
        and str(compliance_report_version_id).lower() not in ["null", "undefined"]
        and str(compliance_report_version_id).isdigit()
    ):
        compliance_report_version_id_int = int(compliance_report_version_id)
    else:
        compliance_report_version_id_int = None  # Treat as missing if invalid or not provided

    # Get the compliance access status using the service layer
    status = UserComplianceAccessStatus.get_user_compliance_access_status(
        user_guid,
        compliance_report_version_id_int,
    )

    return {"status": status}
