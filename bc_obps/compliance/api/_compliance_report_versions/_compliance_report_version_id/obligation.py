from dataclasses import asdict
from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.payments import ElicensingPaymentListOut
from compliance.schema.compliance_obligation import ObligationWithPaymentsOut


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation",
    response={200: ObligationWithPaymentsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get obligation data with payments for a compliance report version",
    auth=authorize("approved_industry_user"),
)
def get_obligation_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], ObligationWithPaymentsOut]:
    """
    Get obligation data with payments for a compliance report version.
    Returns: outstanding balance, reporting year, tCO2e equivalent, obligation ID, and payments.
    """
    obligation_data = ComplianceObligationService.get_obligation_data_by_report_version(compliance_report_version_id)
    payment_data = ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    payment_list = ElicensingPaymentListOut(
        data_is_fresh=payment_data.data_is_fresh,
        rows=list(payment_data.data),  # type: ignore [arg-type] # Mypy does not recognize queryset as iterable. Function is working as expected
        row_count=len(payment_data.data),
    )

    response = ObligationWithPaymentsOut(
        **asdict(obligation_data),
        payments=payment_list,
    )

    return 200, response
