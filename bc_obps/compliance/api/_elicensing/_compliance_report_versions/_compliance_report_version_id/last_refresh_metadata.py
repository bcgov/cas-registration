
from ninja.types import DictStrAny
from compliance.api.router import router
from typing import Literal, Tuple
from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.constants import COMPLIANCE
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth
from compliance.schema.elicensing_invoice import ElicensingLastRefreshOut

@router.get(
    "/elicensing/compliance-report-versions/{compliance_report_version_id}/last-refresh-metadata",
    response={200:  ElicensingLastRefreshOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="""Returns E-licensing sync metadata: `last_refreshed_date` (ISO-8601 | null) — timestamp of the most recent successful sync, and `data_is_fresh` (boolean) — whether that sync is within the configured freshness window.""",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def format_last_refresh_metadatadata(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], DictStrAny]:

    # Get the refresh_data_wrapper result
    refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    # Build the refresh data metadata payload
    payload = ElicensingDataRefreshService.format_last_refresh_metadata(refresh_result)

    return 200, payload
