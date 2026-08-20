from typing import Literal, Tuple
from datetime import datetime, timedelta
from django.http import HttpRequest
from ninja.errors import HttpError
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.calculated_penalty import CalculatedPenaltyOut, PenaltyAccrual
from compliance.models import CompliancePenalty, ComplianceObligation
from compliance.service.penalty_calculation_service import PenaltyCalculationService
from compliance.api.permissions import approved_authorized_roles_compliance_report_version_composite_auth


def _normalize_penalty_type(penalty_type: str) -> str:
    normalized = penalty_type.strip().lower().replace("-", "_").replace(" ", "_")

    if normalized in {"automatic_overdue", "automaticoverdue"}:
        return CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
    if normalized in {"late_submission", "latesubmission", "ggeapar"}:
        return CompliancePenalty.PenaltyType.LATE_SUBMISSION

    return penalty_type


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/calculate-penalty",
    response={200: CalculatedPenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Calculate the potential penalty for an obligation that is accruing a penalty",
    auth=approved_authorized_roles_compliance_report_version_composite_auth,
)
def get_calculated_penalty_for_obligation(
    request: HttpRequest, compliance_report_version_id: int, penalty_type: str, end_date: str
) -> Tuple[Literal[200], CalculatedPenaltyOut]:
    date_format_string = "%Y-%m-%d"
    formatted_end_date = datetime.strptime(end_date, date_format_string).date()
    obligation = ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)
    compliance_deadline = obligation.compliance_report_version.compliance_report.compliance_period.compliance_deadline
    start_date = compliance_deadline + timedelta(days=1)

    penalty_accrual_context = PenaltyCalculationService.get_penalty_accrual_context(obligation=obligation)
    print(f"\n\nPenalty accrual context: {penalty_accrual_context}\n\n")

    penalty_type = _normalize_penalty_type(penalty_type)

    if penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE:
        # Automatic Overdue Penalty begins accruing 1 day after the compliance deadline unless it is a supplementary report that came in after the deadline.
        # In that case, the Automatic Overdue Penalty begins accruing 1 day after the invoice due date
        created_at = obligation.created_at
        elicensing_invoice = obligation.elicensing_invoice

        if (
            obligation.compliance_report_version.is_supplementary
            and created_at is not None
            and created_at.date() > compliance_deadline
            and elicensing_invoice is not None
        ):
            start_date = elicensing_invoice.due_date + timedelta(days=1)
        calculated_penalty = PenaltyCalculationService.calculate_penalty(
            obligation=obligation, accrual_start_date=start_date, final_accrual_date=formatted_end_date
        )
    elif penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION:
        start_date = compliance_deadline + timedelta(days=1)

        calculated_penalty = PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=obligation, accrual_start_date=start_date, final_accrual_date=formatted_end_date
        )
    else:
        raise HttpError(
            400,
            f"Invalid penalty_type '{penalty_type}'. Expected '{CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE}' or '{CompliancePenalty.PenaltyType.LATE_SUBMISSION}'.",
        )

    response = CalculatedPenaltyOut(
        penalty_type=calculated_penalty.penalty_type,
        days_late=calculated_penalty.days_late,
        total_penalty=calculated_penalty.total_penalty,
        daily_accumulated_list=[
            PenaltyAccrual(
                date=accrual.date,
                interest_rate=accrual.interest_rate,
                daily_penalty=accrual.daily_penalty,
                daily_compounded=accrual.daily_compounded,
                accumulated_penalty=accrual.accumulated_penalty,
                accumulated_compounded=accrual.accumulated_compounded,
            )
            for accrual in calculated_penalty.daily_accumulated_list
        ],
    )

    return 200, response
