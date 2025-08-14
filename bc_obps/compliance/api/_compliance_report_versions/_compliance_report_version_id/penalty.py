from typing import Literal, Tuple
from compliance.constants import COMPLIANCE
from compliance.schema.automatic_overdue_penalty import PenaltyWithPaymentsOut
from compliance.schema.elicensing_payments import ElicensingPaymentListOut
from compliance.service.penalty_summary_service import PenaltySummaryService
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
    summary = PenaltySummaryService.get_summary_by_compliance_report_version_id(
        compliance_report_version_id=compliance_report_version_id
    )

    payment_data = ElicensingPaymentListOut(
        data_is_fresh=summary["payments_fresh"],
        rows=list(summary["payments"]),
        row_count=len(summary["payments"]),
    )

    penalty_summary = PenaltyWithPaymentsOut(
        outstanding_amount=summary["outstanding_amount"],
        penalty_status=summary["penalty_status"],
        data_is_fresh=summary["data_is_fresh"],
        payment_data=payment_data,
    )

    return 200, penalty_summary
