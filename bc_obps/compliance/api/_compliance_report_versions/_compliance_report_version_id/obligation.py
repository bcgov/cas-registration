from dataclasses import asdict
from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from compliance.schema.compliance_obligation import ObligationWithPaymentsOut
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation",
    response={200: ObligationWithPaymentsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get obligation data with payments for a compliance report version",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_obligation_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], ObligationWithPaymentsOut]:
    """
    Get obligation data with payments for a compliance report version.
    Returns: outstanding balance, reporting year, tCO2e equivalent, obligation ID, and payments.
    """
    payments = ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )
    obligation_data = ComplianceObligationService.get_obligation_data_by_report_version(compliance_report_version_id)

    payment_data = ElicensingPaymentListOut(
        data_is_fresh=payments.data_is_fresh,
        rows=list(payments.data),  # type: ignore [arg-type] # Mypy does not recognize queryset as iterable. Function is working as expected
        row_count=len(payments.data),
    )

    response = ObligationWithPaymentsOut(
        **asdict(obligation_data),
        payment_data=payment_data,
    )

    return 200, response
