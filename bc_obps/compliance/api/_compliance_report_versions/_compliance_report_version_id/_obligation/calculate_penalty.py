from typing import Literal, Tuple
from datetime import datetime, date, timedelta
from django.http import HttpRequest
from django.utils import timezone
from ninja.errors import HttpError
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.calculated_penalty import CalculatedPenaltyOut, PenaltyAccrual, PenaltyTypeStatusEnum
from compliance.models import CompliancePenalty, ComplianceObligation
from compliance.service.penalty_calculation_service import (
    PenaltyAccrualContext,
    PenaltyCalculationService,
    CalculatedPenaltyData,
)
from common.permissions import authorize


def _normalize_penalty_type(penalty_type: str) -> str:
    normalized = penalty_type.strip().lower().replace("-", "_").replace(" ", "_")

    if normalized in {"automatic_overdue", "automaticoverdue"}:
        return CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
    if normalized in {"late_submission", "latesubmission", "ggeapar"}:
        return CompliancePenalty.PenaltyType.LATE_SUBMISSION

    return penalty_type


def _get_penalty_statuses(
    obligation: ComplianceObligation,
    penalty_accrual_context: PenaltyAccrualContext,
) -> Tuple[PenaltyTypeStatusEnum, PenaltyTypeStatusEnum]:
    automatic_overdue_penalty_status = PenaltyTypeStatusEnum.NONE
    ggeapar_interest_status = PenaltyTypeStatusEnum.NONE

    if penalty_accrual_context.effective_deadline < timezone.now().date():
        automatic_overdue_penalty_status = PenaltyTypeStatusEnum.ACCRUING

    if obligation.compliance_report_version.is_supplementary and penalty_accrual_context.has_late_submission:
        ggeapar_interest_status = PenaltyTypeStatusEnum.ACCRUING

    return automatic_overdue_penalty_status, ggeapar_interest_status


def _calculate_penalty_for_type(
    obligation: ComplianceObligation,
    requested_penalty_type: str,
    compliance_deadline: date,
    final_accrual_date: date,
    penalty_accrual_context: PenaltyAccrualContext,
) -> CalculatedPenaltyData:
    default_start_date = compliance_deadline + timedelta(days=1)

    if requested_penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE:
        # Automatic Overdue Penalty begins accruing 1 day after the compliance deadline unless it is a
        # supplementary report that came in after the deadline. In that case, it begins accruing 1 day
        # after the invoice due date.
        start_date = penalty_accrual_context.effective_deadline + timedelta(days=1)
        return PenaltyCalculationService.calculate_penalty(
            obligation=obligation,
            accrual_start_date=start_date,
            final_accrual_date=final_accrual_date,
        )

    if requested_penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION:
        return PenaltyCalculationService.calculate_late_submission_penalty(
            obligation=obligation,
            accrual_start_date=default_start_date,
            final_accrual_date=final_accrual_date,
        )

    raise HttpError(
        400,
        f"Invalid penalty_type '{requested_penalty_type}'. Expected '{CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE}' or '{CompliancePenalty.PenaltyType.LATE_SUBMISSION}'.",
    )


def _build_calculated_penalty_response(
    calculated_penalty: CalculatedPenaltyData,
    automatic_overdue_penalty_status: PenaltyTypeStatusEnum,
    ggeapar_interest_status: PenaltyTypeStatusEnum,
) -> CalculatedPenaltyOut:
    return CalculatedPenaltyOut(
        automatic_overdue_penalty_status=automatic_overdue_penalty_status,
        ggeapar_interest_status=ggeapar_interest_status,
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


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation/calculate-penalty",
    response={200: CalculatedPenaltyOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Calculate the potential penalty for an obligation that is accruing a penalty",
    auth=authorize("authorized_irc_user"),
)
def get_calculated_penalty_for_obligation(
    request: HttpRequest, compliance_report_version_id: int, requested_penalty_type: str, end_date: str
) -> Tuple[Literal[200], CalculatedPenaltyOut] | Tuple[Literal[422], dict[str, str]]:
    date_format_string = "%Y-%m-%d"
    formatted_end_date = datetime.strptime(end_date, date_format_string).date()
    obligation = ComplianceObligation.objects.select_related(
        'compliance_report_version__compliance_report__compliance_period', 'elicensing_invoice'
    ).get(compliance_report_version_id=compliance_report_version_id)
    penalty_accrual_context = PenaltyCalculationService.get_penalty_accrual_context(obligation=obligation)

    # determine penalty type statuses
    automatic_overdue_penalty_status, ggeapar_interest_status = _get_penalty_statuses(
        obligation,
        penalty_accrual_context,
    )

    # Note that this is what type of penalty we should be calculating, not necessarily what type of penalty is currently accruing
    requested_penalty_type = _normalize_penalty_type(requested_penalty_type)

    if (
        requested_penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        and not obligation.compliance_report_version.is_supplementary
    ):
        return 422, {"message": "GGEAPAR interest only applies to obligations for supplementary compliance reports."}

    calculated_penalty = _calculate_penalty_for_type(
        obligation=obligation,
        requested_penalty_type=requested_penalty_type,
        compliance_deadline=obligation.compliance_report_version.compliance_report.compliance_period.compliance_deadline,
        final_accrual_date=formatted_end_date,
        penalty_accrual_context=penalty_accrual_context,
    )

    response = _build_calculated_penalty_response(
        calculated_penalty=calculated_penalty,
        automatic_overdue_penalty_status=automatic_overdue_penalty_status,
        ggeapar_interest_status=ggeapar_interest_status,
    )

    return 200, response
