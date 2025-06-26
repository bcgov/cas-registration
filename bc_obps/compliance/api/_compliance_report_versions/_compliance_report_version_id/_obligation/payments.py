from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.payments import ElicensingPaymentListOut, PaymentOut


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/payments",
    response={200: ElicensingPaymentListOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get payments for a compliance report version's obligation",
    auth=authorize("approved_industry_user"),
)
def get_compliance_obligation_payments_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], ElicensingPaymentListOut]:
    payment_data = ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    payment_rows = [PaymentOut.from_elicensing_payment(payment) for payment in payment_data.data]
    response = ElicensingPaymentListOut(
        data_is_fresh=payment_data.data_is_fresh, rows=payment_rows, row_count=len(payment_rows)
    )

    return 200, response
