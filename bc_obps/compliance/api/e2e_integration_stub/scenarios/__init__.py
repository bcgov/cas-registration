from typing import Dict
from .base import ScenarioHandler
from .earned_credits import (
    EarnedCreditsRequestIssuanceScenario,
    EarnedCreditsDirectorApproveScenario,
)
from .submit_report import SubmitReportScenario
from .reporting_year import GetReportingYearScenario


SCENARIO_HANDLERS: Dict[str, ScenarioHandler] = {
    "submit_report": SubmitReportScenario(),
    "earned_credits_request_issuance": EarnedCreditsRequestIssuanceScenario(),
    "earned_credits_director_approve": EarnedCreditsDirectorApproveScenario(),
    "reporting_year": GetReportingYearScenario(),
}


__all__ = [
    "SCENARIO_HANDLERS",
    "ScenarioHandler",
    "SubmitReportScenario",
    "EarnedCreditsRequestIssuanceScenario",
    "EarnedCreditsDirectorApproveScenario",
    "GetReportingYearScenario",
]
