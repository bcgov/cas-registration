from typing import Literal, Tuple
from django.http import HttpRequest
from compliance.constants import COMPLIANCE
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.schema.calculated_penalty import CalculatedPenaltyOut, PenaltyAccrual
from compliance.service.penalty_calculation_service import (
    PenaltyCalculationService,
)
from common.permissions import authorize


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

    result = PenaltyCalculationService.calculate_penalty_for_obligation(
        compliance_report_version_id, requested_penalty_type, end_date
    )

    calculated_penalty = result.calculated_penalty

    return 200, CalculatedPenaltyOut(
        automatic_overdue_penalty_status=result.automatic_overdue_penalty_status,
        ggeapar_interest_status=result.ggeapar_interest_status,
        message=result.message,
        penalty_type=calculated_penalty.penalty_type if calculated_penalty else None,
        days_late=calculated_penalty.days_late if calculated_penalty else None,
        total_penalty=calculated_penalty.total_penalty if calculated_penalty else None,
        daily_accumulated_list=(
            [
                PenaltyAccrual(
                    date=accrual.date,
                    interest_rate=accrual.interest_rate,
                    daily_penalty=accrual.daily_penalty,
                    daily_compounded=accrual.daily_compounded,
                    accumulated_penalty=accrual.accumulated_penalty,
                    accumulated_compounded=accrual.accumulated_compounded,
                )
                for accrual in calculated_penalty.daily_accumulated_list
            ]
            if calculated_penalty
            else []
        ),
    )
