from decimal import Decimal
from compliance.models.compliance_obligation import ComplianceObligation
from django.test import TestCase
from unittest.mock import patch
import pytest
from model_bakery.baker import make_recipe
from compliance.dataclass import PaymentDataWithFreshnessFlag
from compliance.models import ElicensingPayment
from compliance.service.penalty_summary_service import PenaltySummaryService

pytestmark = pytest.mark.django_db


class TestPenaltySummaryService(TestCase):
    """Unit tests for PenaltySummaryService"""

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id"
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_penalty_data")
    def test_get_summary_happy_path_with_payments(self, mock_get_penalty_data, mock_get_payments):
        # Arrange
        obligation = make_recipe("compliance.tests.utils.compliance_obligation")

        payment_1 = make_recipe(
            "compliance.tests.utils.elicensing_payment",
            amount=Decimal("10.00"),
        )
        payment_2 = make_recipe(
            "compliance.tests.utils.elicensing_payment",
            amount=Decimal("15.50"),
            elicensing_line_item=payment_1.elicensing_line_item,
        )
        payments = ElicensingPayment.objects.filter(pk__in=[payment_1.pk, payment_2.pk])

        mock_get_penalty_data.return_value = {
            "total_amount": Decimal("100.00"),
            "penalty_status": ComplianceObligation.PenaltyStatus.NOT_PAID,
            "data_is_fresh": True,
        }
        mock_get_payments.return_value = PaymentDataWithFreshnessFlag(
            data_is_fresh=True,
            data=payments,
        )

        # Act
        summary = PenaltySummaryService.get_summary_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        # Assert
        assert summary["penalty_status"] == ComplianceObligation.PenaltyStatus.NOT_PAID
        assert summary["data_is_fresh"] is True
        assert summary["payments_is_fresh"] is True
        assert summary["outstanding_amount"] == Decimal("74.50")
        assert list(summary["payments"]) == list(payments)

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id"
    )
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_penalty_data")
    def test_get_summary_handles_no_payments(self, mock_get_penalty_data, mock_get_payments):
        # Arrange
        obligation = make_recipe("compliance.tests.utils.compliance_obligation")

        mock_get_penalty_data.return_value = {
            "total_amount": Decimal("42.00"),
            "penalty_status": ComplianceObligation.PenaltyStatus.NOT_PAID,
            "data_is_fresh": True,
        }
        mock_get_payments.return_value = PaymentDataWithFreshnessFlag(
            data_is_fresh=False,
            data=ElicensingPayment.objects.none(),
        )

        # Act
        summary = PenaltySummaryService.get_summary_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )

        # Assert
        assert summary["outstanding_amount"] == Decimal("42.00")
        assert summary["payments_is_fresh"] is False
        assert list(summary["payments"]) == []
