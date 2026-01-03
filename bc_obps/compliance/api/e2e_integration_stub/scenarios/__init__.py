from typing import Dict
from .base import ScenarioHandler
from .earned_credits import (
    EarnedCreditsRequestIssuanceScenario,
    EarnedCreditsDirectorApproveScenario,
    EarnedCreditsDirectorDeclineScenario,
)
from .submit_report import SubmitReportScenario


SCENARIO_HANDLERS: Dict[str, ScenarioHandler] = {
    "submit_report": SubmitReportScenario(),
    "earned_credits_request_issuance": EarnedCreditsRequestIssuanceScenario(),
    "earned_credits_director_approve": EarnedCreditsDirectorApproveScenario(),
    "earned_credits_director_decline": EarnedCreditsDirectorDeclineScenario(),
}


__all__ = [
    "SCENARIO_HANDLERS",
    "ScenarioHandler",
    "SubmitReportScenario",
    "EarnedCreditsRequestIssuanceScenario",
    "EarnedCreditsDirectorApproveScenario",
    "EarnedCreditsDirectorDeclineScenario",
]
