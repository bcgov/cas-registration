from typing import Literal, Tuple
from decimal import Decimal
from compliance.constants import COMPLIANCE
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.schema.automatic_overdue_penalty import PenaltyWithPaymentsOut
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from registration.schema.generic import Message
from common.permissions import authorize

from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.api.router import router


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/penalty",
    response={200: PenaltyWithPaymentsOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get penalty data with payments for a compliance report version",
    auth=authorize("approved_industry_user"),
)
def get_penalty_by_compliance_report_version_id(
    request: HttpRequest, compliance_report_version_id: int
) -> Tuple[Literal[200], PenaltyWithPaymentsOut]:
    """
    Get penalty data with payments for a compliance report version.
    Returns: outstanding amount, reporting year, penalty status and payments for a compliance report version.
    """
    obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)

    penalty_data = PenaltyCalculationService.get_penalty_data(obligation=obligation)

    # Sum of payments received after the due date
    invoice = obligation.elicensing_invoice
    payments_sum_after_due: Decimal = (
        PenaltyCalculationService.sum_payments_after_date(invoice, invoice.due_date.date())
        if invoice
        else Decimal('0.00')
    )

    payments = ComplianceDashboardService.get_peanlty_payments_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    payment_data = ElicensingPaymentListOut(
        data_is_fresh=payments.data_is_fresh,
        rows=list(payments.data),  # type: ignore [arg-type] # Mypy does not recognize queryset as iterable. Function is working as expected
        row_count=len(payments.data),
    )

    outstanding_amount = penalty_data["total_amount"] - payments_sum_after_due

    penalty_summary = PenaltyWithPaymentsOut(
        outstanding_amount=outstanding_amount,
        penalty_status=penalty_data["penalty_status"],
        data_is_fresh=penalty_data["data_is_fresh"],
        payment_data=payment_data,
    )

    return 200, penalty_summary
