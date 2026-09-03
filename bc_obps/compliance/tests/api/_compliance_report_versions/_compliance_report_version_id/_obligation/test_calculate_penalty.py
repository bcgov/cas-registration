from decimal import Decimal
from datetime import date, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from django.http import HttpRequest
from django.utils import timezone
from ninja.errors import HttpError
from model_bakery import baker

from compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty import (
    get_calculated_penalty_for_obligation,
)
from compliance.models import CompliancePenalty
from compliance.schema.calculated_penalty import PenaltyTypeStatusEnum

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
    report_version = obligation.compliance_report_version
    report_version.is_supplementary = True
    report_version.save(update_fields=["is_supplementary"])
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


def test_get_calculated_penalty_for_obligation_ggeapar_returns_message_for_non_supplementary():
    obligation = _make_obligation()
    # Default recipe has is_supplementary=False; GGEAPAR is not applicable here
    status, response = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "ggeapar",
        "2025-01-10",
    )

    assert status == 200
    assert response.message == "GGEAPAR interest only applies to obligations for supplementary compliance reports."
    assert response.penalty_type is None
    assert response.days_late is None
    assert response.total_penalty is None
    assert response.daily_accumulated_list == []


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_penalty_accrual_context"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_late_submission_penalty"
)
def test_get_calculated_penalty_for_obligation_sets_accruing_statuses_for_late_supplementary(
    mock_calculate_late_submission_penalty,
    mock_get_penalty_accrual_context,
):
    obligation = _make_obligation()
    report_version = obligation.compliance_report_version
    report_version.is_supplementary = True
    report_version.save(update_fields=["is_supplementary"])

    mock_get_penalty_accrual_context.return_value = SimpleNamespace(
        effective_deadline=date.today() - timedelta(days=1),
        has_late_submission=True,
    )
    mock_calculate_late_submission_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        days_late=1,
        total_penalty=Decimal("1.00"),
        daily_accumulated_list=[],
    )

    status, response = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "late_submission",
        "2025-01-10",
    )

    assert status == 200
    # expect ACCRUING statuses for both automatic overdue and ggeapar, because it's a supplementary report
    # and was submitted a day late
    assert response.automatic_overdue_penalty_status == PenaltyTypeStatusEnum.ACCRUING
    assert response.ggeapar_interest_status == PenaltyTypeStatusEnum.ACCRUING


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_penalty_accrual_context"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_penalty"
)
def test_get_calculated_penalty_for_obligation_sets_none_statuses_when_not_accruing(
    mock_calculate_penalty,
    mock_get_penalty_accrual_context,
):
    obligation = _make_obligation()
    report_version = obligation.compliance_report_version
    report_version.is_supplementary = False
    report_version.save(update_fields=["is_supplementary"])

    mock_get_penalty_accrual_context.return_value = SimpleNamespace(
        effective_deadline=date.today(),
        has_late_submission=False,
    )
    mock_calculate_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        days_late=0,
        total_penalty=Decimal("0.00"),
        daily_accumulated_list=[],
    )

    status, response = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "automatic_overdue",
        "2025-01-10",
    )

    assert status == 200
    assert response.automatic_overdue_penalty_status == PenaltyTypeStatusEnum.NONE
    assert response.ggeapar_interest_status == PenaltyTypeStatusEnum.NONE


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_penalty_accrual_context"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_penalty"
)
def test_get_calculated_penalty_for_obligation_automatic_overdue_uses_invoice_due_date_for_late_supplementary(
    mock_calculate_penalty,
    mock_get_penalty_accrual_context,
):
    obligation = _make_obligation()
    report_version = obligation.compliance_report_version
    report_version.is_supplementary = True
    report_version.save(update_fields=["is_supplementary"])

    compliance_deadline = report_version.compliance_report.compliance_period.compliance_deadline
    # obligation's created_at is set to be 2 days after the compliance_deadline
    created_at = compliance_deadline + timedelta(days=2)
    # invoice due_date is set to be 30 days after the compliance_deadline
    invoice = baker.make_recipe(
        "compliance.tests.utils.elicensing_invoice",
        due_date=compliance_deadline + timedelta(days=30),
    )
    obligation.created_at = created_at
    obligation.elicensing_invoice = invoice
    obligation.save(update_fields=["created_at", "elicensing_invoice"])

    mock_get_penalty_accrual_context.return_value = SimpleNamespace(
        effective_deadline=invoice.due_date,
        has_late_submission=True,
    )
    mock_calculate_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        days_late=1,
        total_penalty=Decimal("10.00"),
        daily_accumulated_list=[],
    )

    status, _ = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "automatic-overdue",
        "2025-01-10",
    )

    assert status == 200
    # assert the automatic_overdue_penalty accrual_start_date is 1 day after the invoice's due date
    assert mock_calculate_penalty.call_args.kwargs["accrual_start_date"] == invoice.due_date + timedelta(days=1)


@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.get_penalty_accrual_context"
)
@patch(
    "compliance.api._compliance_report_versions._compliance_report_version_id._obligation.calculate_penalty.PenaltyCalculationService.calculate_late_submission_penalty"
)
def test_get_calculated_penalty_for_ggeapar_uses_compliance_deadline_for_late_supplementary(
    mock_calculate_late_submission_penalty,
    mock_get_penalty_accrual_context,
):
    obligation = _make_obligation()
    report_version = obligation.compliance_report_version
    report_version.is_supplementary = True
    report_version.save(update_fields=["is_supplementary"])

    compliance_deadline = report_version.compliance_report.compliance_period.compliance_deadline
    # obligation's created_at is set to be 2 days after the compliance_deadline
    created_at = timezone.make_aware(datetime.combine(compliance_deadline + timedelta(days=2), datetime.min.time()))
    # invoice due_date is set to be 30 days after the compliance_deadline
    invoice = baker.make_recipe(
        "compliance.tests.utils.elicensing_invoice",
        due_date=compliance_deadline + timedelta(days=30),
    )
    obligation.created_at = created_at
    obligation.elicensing_invoice = invoice
    obligation.save(update_fields=["created_at", "elicensing_invoice"])

    mock_get_penalty_accrual_context.return_value = SimpleNamespace(
        effective_deadline=compliance_deadline,
        has_late_submission=True,
    )
    mock_calculate_late_submission_penalty.return_value = SimpleNamespace(
        penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        days_late=1,
        total_penalty=Decimal("10.00"),
        daily_accumulated_list=[],
    )

    status, _ = get_calculated_penalty_for_obligation(
        HttpRequest(),
        obligation.compliance_report_version_id,
        "late-submission",
        "2025-01-10",
    )

    assert status == 200
    # assert late_submission (ggeapar) accrual_start_date is 1 day after the compliance deadline
    assert mock_calculate_late_submission_penalty.call_args.kwargs[
        "accrual_start_date"
    ] == compliance_deadline + timedelta(days=1)
