from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from django.http import HttpRequest
from ninja.errors import HttpError
from model_bakery import baker

from compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty import (
    get_calculated_penalty_for_obligation,
)
from compliance.models import CompliancePenalty

pytestmark = pytest.mark.django_db


def _make_obligation():
    compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
    obligation = baker.make_recipe(
        "compliance.tests.utils.compliance_obligation",
        compliance_report_version=compliance_report_version,
        fee_amount_dollars=Decimal("1000.00"),
    )
    return obligation


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_late_submission_penalty_data"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_automatic_overdue_penalty_data"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_penalty"
)
def test_get_calculated_penalty_for_obligation_automatic_overdue_success(
    mock_calculate_penalty,
    mock_get_automatic_overdue_penalty_data,
    mock_get_late_submission_penalty_data,
):
    obligation = _make_obligation()
    mock_get_automatic_overdue_penalty_data.return_value = {"penalty_type": "Automatic Overdue"}
    mock_get_late_submission_penalty_data.return_value = {"penalty_type": "Late Submission"}
    mock_calculate_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        days_late=3,
        total_penalty=Decimal("30.00"),
        daily_accumulated_list=[
            SimpleNamespace(
                date="2025-01-01",
                interest_rate=Decimal("0.38"),
                daily_penalty=Decimal("10.00"),
                daily_compounded=Decimal("1.00"),
                accumulated_penalty=Decimal("10.00"),
                accumulated_compounded=Decimal("1.00"),
            )
        ],
    )

    status, response = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "automatic-overdue",
        "2025-01-10",
    )

    assert status == 200
    assert response.penalty_type == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
    assert response.days_late == 3
    assert response.total_penalty == Decimal("30.00")
    assert response.daily_accumulated_list[0].date == "2025-01-01"
    assert response.daily_accumulated_list[0].daily_penalty == Decimal("10.00")
    mock_calculate_penalty.assert_called_once()


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_late_submission_penalty_data"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_automatic_overdue_penalty_data"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_late_submission_penalty"
)
def test_get_calculated_penalty_for_obligation_late_submission_success(
    mock_calculate_late_submission_penalty,
    mock_get_automatic_overdue_penalty_data,
    mock_get_late_submission_penalty_data,
):
    obligation = _make_obligation()
    mock_get_automatic_overdue_penalty_data.return_value = {"penalty_type": "Automatic Overdue"}
    mock_get_late_submission_penalty_data.return_value = {"penalty_type": "Late Submission"}
    mock_calculate_late_submission_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        days_late=2,
        total_penalty=Decimal("12.50"),
        daily_accumulated_list=[
            SimpleNamespace(
                date="2025-01-01",
                interest_rate=Decimal("0.50"),
                daily_penalty=Decimal("6.25"),
                daily_compounded=Decimal("0.50"),
                accumulated_penalty=Decimal("6.25"),
                accumulated_compounded=Decimal("0.50"),
            )
        ],
    )

    status, response = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "late_submission",
        "2025-01-10",
    )

    assert status == 200
    assert response.penalty_type == CompliancePenalty.PenaltyType.LATE_SUBMISSION
    assert response.days_late == 2
    assert response.total_penalty == Decimal("12.50")
    assert response.daily_accumulated_list[0].daily_compounded == Decimal("0.50")
    mock_calculate_late_submission_penalty.assert_called_once()


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_late_submission_penalty_data"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_automatic_overdue_penalty_data"
)
def test_get_calculated_penalty_for_obligation_invalid_penalty_type_raises_http_error(
    mock_get_automatic_overdue_penalty_data,
    mock_get_late_submission_penalty_data,
):
    obligation = _make_obligation()
    mock_get_automatic_overdue_penalty_data.return_value = {"penalty_type": "Automatic Overdue"}
    mock_get_late_submission_penalty_data.return_value = {"penalty_type": "Late Submission"}

    with pytest.raises(HttpError, match="Invalid penalty_type 'not_a_valid_type'"):
        get_calculated_penalty_for_obligation(
            HttpRequest(),
            obligation.compliance_report_version_id,
            "not_a_valid_type",
            "2025-01-10",
        )
