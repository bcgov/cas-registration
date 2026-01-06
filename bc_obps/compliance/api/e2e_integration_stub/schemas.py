from typing import Any, Dict, Optional
from pydantic import Field
from ninja import Schema


class ScenarioPayload(Schema):
    """Request payload for E2E integration stub endpoint.

    Attributes:
        scenario: Name of the scenario to execute (e.g., "submit_report")
        compliance_report_version_id: Optional ID of compliance report version to operate on
        payload: Scenario-specific data (e.g., earned credits details, obligation data)
    """

    scenario: str
    compliance_report_version_id: Optional[int] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
