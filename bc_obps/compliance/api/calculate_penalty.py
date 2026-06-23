from typing import Literal, Tuple
from datetime import datetime, timedelta
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.calculated_penalty import CalculatedPenaltyOut
from compliance.api.permissions import approved_authorized_roles_compliance_report_version_composite_auth
from compliance.models import CompliancePenalty, ComplianceObligation
from compliance.service.penalty_calculation_service import PenaltyCalculationService



@router.get(
    "penalties/obligation/{obligation_id}/calculate-penalty",
    response={200: CalculatedPenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Calculate the potential penalty for an obligation that is accruing a penalty",
    # auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def get_calculated_penalty_for_obligation(
    request: HttpRequest, obligation_id: int, penalty_type: str, end_date: str
) -> Tuple[Literal[200], CalculatedPenaltyOut]:
    date_format_string = "%Y-%m-%d"
    formatted_end_date = datetime.strptime(end_date, date_format_string).date()
    obligation = ComplianceObligation.objects.get(pk=obligation_id)
    compliance_deadline = obligation.compliance_report_version.compliance_report.compliance_period.compliance_deadline
    start_date = compliance_deadline + timedelta(days=1)

    if penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE:
        # Automatic Overdue Penalty begins accruing 1 day after the compliance deadline unless it is a supplementary report that came in after the deadline.
        # In that case, the Automatic Overdue Penalty begins accruing 1 day after the invoice due date
        if obligation.compliance_report_version.is_supplementary and obligation.created_at.date() > compliance_deadline:
            start_date = datetime.strptime(obligation.elicensing_invoice.due_date, date_format_string).date() + timedelta(days=1)
        calculated_penalty = PenaltyCalculationService.calculate_penalty(obligation=obligation, accrual_start_date=start_date, final_accrual_date=formatted_end_date)
    elif penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION:
        start_date = datetime.strptime(obligation.compliance_report_version.compliance_report.compliance_period.compliance_deadline, date_format_string).date() + timedelta(days=1)
        calculated_penalty = PenaltyCalculationService.calculate_penalty(obligation=obligation, accrual_start_date=start_date, final_accrual_date=formatted_end_date)

    response = calculated_penalty

    return 200, response
