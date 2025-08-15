from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/payments",
    response={200: ElicensingPaymentListOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get payments for a compliance report version's obligation",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_compliance_obligation_payments_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], ElicensingPaymentListOut]:
    payment_data = ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )
    response = ElicensingPaymentListOut(
        data_is_fresh=payment_data.data_is_fresh, rows=list(payment_data.data), row_count=len(payment_data.data)  # type: ignore [arg-type] # Mypy does not recognize queryset as iterable. Function is working as expected
    )
    return 200, response
