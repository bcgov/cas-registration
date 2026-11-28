from typing import Literal

from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.api.permissions import (
    approved_industry_user_compliance_report_version_composite_auth,
)
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from django.http import HttpRequest
from registration.schema.generic import Message


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/payments",
    response={200: ElicensingPaymentListOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get payments for a compliance report version's obligation",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_compliance_obligation_payments_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> tuple[Literal[200], dict]:
    payment_data = list(
        ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
    )
    response = {
        "rows": payment_data,
        "row_count": len(payment_data),
    }
    return 200, response
