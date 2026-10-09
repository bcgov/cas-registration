from typing import Dict
from .base import ScenarioHandler
from .earned_credits import (
    EarnedCreditsRequestIssuanceScenario,
    EarnedCreditsDirectorApproveScenario,
)
from .pay_obligation import PayObligationScenario
from .submit_report import SubmitReportScenario
from .automatic_overdue_penalty import AutomaticOverduePenaltyScenario
from .supplementary_late_submission import SupplementaryLateSubmissionScenario


SCENARIO_HANDLERS: Dict[str, ScenarioHandler] = {
    "submit_report": SubmitReportScenario(),
    "earned_credits_request_issuance": EarnedCreditsRequestIssuanceScenario(),
    "earned_credits_director_approve": EarnedCreditsDirectorApproveScenario(),
    "pay_obligation": PayObligationScenario(),
    "automatic_overdue_penalty": AutomaticOverduePenaltyScenario(),
    "supplementary_late_submission": SupplementaryLateSubmissionScenario(),
}


__all__ = [
    "SCENARIO_HANDLERS",
    "ScenarioHandler",
    "SubmitReportScenario",
    "EarnedCreditsRequestIssuanceScenario",
    "EarnedCreditsDirectorApproveScenario",
    "PayObligationScenario",
    "AutomaticOverduePenaltyScenario",
    "SupplementaryLateSubmissionScenario",
]
