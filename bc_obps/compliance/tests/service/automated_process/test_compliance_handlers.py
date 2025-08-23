import pytest
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch
from django.utils import timezone
from model_bakery import baker
from compliance.service.automated_process.compliance_handlers import (
    PenaltyPaidHandler,
    PenaltyAccruingHandler,
    ObligationPaidHandler,
    ComplianceHandlerManager,
)
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion


pytestmark = pytest.mark.django_db


class TestPenaltyPaidHandler:
    def setup_method(self):
        self.compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            penalty_status=ComplianceObligation.PenaltyStatus.NOT_PAID,
        )
        self.invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            outstanding_balance=Decimal("0.00"),
        )
        self.penalty = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            elicensing_invoice=self.invoice,
            compliance_obligation=self.obligation,
        )
        self.handler = PenaltyPaidHandler()

    def test_can_handle_with_penalty_and_paid(self):
        result = self.handler.can_handle(self.invoice)
        assert result is True

    def test_can_not_handle_without_penalty(self):
        self.penalty.delete()
        self.invoice.refresh_from_db()
        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_with_penalty_but_not_paid(self):
        self.invoice.outstanding_balance = Decimal("100.00")
        self.invoice.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_penalty_already_paid(self):
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.PAID
        self.obligation.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_penalty_without_invoice(self):
        # Penalty exists but has no elicensing invoice
        self.penalty.elicensing_invoice = None
        self.penalty.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.update_penalty_status')
    def test_handle_updates_penalty_status(self, mock_update_status):
        self.handler.handle(self.invoice)

        mock_update_status.assert_called_once_with(self.obligation.pk, ComplianceObligation.PenaltyStatus.PAID)

    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.update_penalty_status')
    def test_handle_skips_if_already_paid(self, mock_update_status):
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.PAID
        self.obligation.save()

        self.handler.handle(self.invoice)

        mock_update_status.assert_not_called()


class TestPenaltyAccruingHandler:
    def setup_method(self):
        self.compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            penalty_status=ComplianceObligation.PenaltyStatus.NOT_PAID,
        )
        self.invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            compliance_obligation=self.obligation,
            outstanding_balance=Decimal("100.00"),
            due_date=timezone.now() - timedelta(days=1),  # Past due
        )
        self.handler = PenaltyAccruingHandler()

    def test_can_handle_obligation_not_met_and_overdue(self):
        result = self.handler.can_handle(self.invoice)
        assert result is True

    def test_can_not_handle_with_existing_penalty(self):
        penalty = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
        )
        penalty.elicensing_invoice = self.invoice
        penalty.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_obligation_met(self):
        self.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        self.compliance_report_version.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_not_overdue(self):
        self.invoice.due_date = timezone.now() + timedelta(days=1)
        self.invoice.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_no_outstanding_balance(self):
        self.invoice.outstanding_balance = Decimal("0.00")
        self.invoice.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.update_penalty_status')
    def test_handle_updates_penalty_status(self, mock_update_status):
        self.handler.handle(self.invoice)
        mock_update_status.assert_called_once_with(self.obligation.pk, ComplianceObligation.PenaltyStatus.ACCRUING)

    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.update_penalty_status')
    def test_handle_skips_if_already_accruing(self, mock_update_status):
        self.obligation.penalty_status = ComplianceObligation.PenaltyStatus.ACCRUING
        self.obligation.save()

        self.handler.handle(self.invoice)

        mock_update_status.assert_not_called()


class TestObligationPaidHandler:
    def setup_method(self):
        self.compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
        )
        self.invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            compliance_obligation=self.obligation,
            outstanding_balance=Decimal("0.00"),
            due_date=timezone.now() - timedelta(days=1),  # Past due
        )
        self.handler = ObligationPaidHandler()

    def test_can_handle_obligation_not_met_and_paid(self):
        result = self.handler.can_handle(self.invoice)
        assert result is True

    def test_can_not_handle_obligation_already_met(self):
        self.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        self.compliance_report_version.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_with_outstanding_balance(self):
        self.invoice.outstanding_balance = Decimal("100.00")
        self.invoice.save()

        result = self.handler.can_handle(self.invoice)
        assert result is False

    def test_can_not_handle_with_penalty_invoice(self):
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.obligation,
            elicensing_invoice=self.invoice,
        )

        result = self.handler.can_handle(self.invoice)
        assert result is False

    @patch('compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty')
    def test_handle_updates_compliance_status_and_creates_penalty_when_overdue(self, mock_create_penalty):
        self.handler.handle(self.invoice)

        self.compliance_report_version.refresh_from_db()
        assert self.compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        mock_create_penalty.assert_called_once_with(self.obligation)

    @patch('compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty')
    def test_handle_updates_compliance_status_but_does_not_create_penalty_when_not_overdue(self, mock_create_penalty):
        self.invoice.due_date = timezone.now() + timedelta(days=1)
        self.invoice.save()

        self.handler.handle(self.invoice)

        self.compliance_report_version.refresh_from_db()
        assert self.compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        mock_create_penalty.assert_not_called()


class TestComplianceHandlerManager:
    def setup_method(self):
        self.manager = ComplianceHandlerManager()
        self.compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        self.obligation = baker.make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            penalty_status=ComplianceObligation.PenaltyStatus.NOT_PAID,
        )

    def test_initialization(self):
        assert len(self.manager.handlers) == 3
        assert any(isinstance(h, PenaltyPaidHandler) for h in self.manager.handlers)
        assert any(isinstance(h, PenaltyAccruingHandler) for h in self.manager.handlers)
        assert any(isinstance(h, ObligationPaidHandler) for h in self.manager.handlers)

    def test_process_compliance_updates_no_handlers_match(self):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            compliance_obligation=self.obligation,
            outstanding_balance=Decimal("100.00"),
            due_date=timezone.now() + timedelta(days=1),  # Not overdue
        )

        # Mock the handle methods of all handlers
        with patch.object(self.manager.handlers[0], 'handle') as mock_penalty_paid_handle, patch.object(
            self.manager.handlers[1], 'handle'
        ) as mock_penalty_accruing_handle, patch.object(
            self.manager.handlers[2], 'handle'
        ) as mock_obligation_paid_handle:

            self.manager.process_compliance_updates(invoice)

            # Verify that none of the handlers' handle methods were called
            mock_penalty_paid_handle.assert_not_called()
            mock_penalty_accruing_handle.assert_not_called()
            mock_obligation_paid_handle.assert_not_called()

    @patch('compliance.service.compliance_obligation_service.ComplianceObligationService.update_penalty_status')
    def test_process_compliance_updates_penalty_accruing_handler_matches(self, mock_update_status):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            compliance_obligation=self.obligation,
            outstanding_balance=Decimal("100.00"),
            due_date=timezone.now() - timedelta(days=1),  # Overdue
        )

        # Spy on all handlers to verify which ones are called
        with patch.object(
            self.manager.handlers[0], 'handle', wraps=self.manager.handlers[0].handle
        ) as spy_penalty_paid, patch.object(
            self.manager.handlers[1], 'handle', wraps=self.manager.handlers[1].handle
        ) as spy_penalty_accruing, patch.object(
            self.manager.handlers[2], 'handle', wraps=self.manager.handlers[2].handle
        ) as spy_obligation_paid:

            self.manager.process_compliance_updates(invoice)

            # Verify only PenaltyAccruingHandler's handle method was called
            spy_penalty_paid.assert_not_called()
            spy_penalty_accruing.assert_called_once_with(invoice)
            spy_obligation_paid.assert_not_called()

        # Verify the service was called as expected
        mock_update_status.assert_called_once_with(self.obligation.pk, ComplianceObligation.PenaltyStatus.ACCRUING)

    @patch('compliance.service.penalty_calculation_service.PenaltyCalculationService.create_penalty')
    def test_process_compliance_updates_obligation_paid_handler_matches(self, mock_create_penalty):
        invoice = baker.make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            compliance_obligation=self.obligation,
            outstanding_balance=Decimal("0.00"),
            due_date=timezone.now() - timedelta(days=1),  # Overdue
        )

        # Spy on all handlers to verify which ones are called
        with patch.object(
            self.manager.handlers[0], 'handle', wraps=self.manager.handlers[0].handle
        ) as spy_penalty_paid, patch.object(
            self.manager.handlers[1], 'handle', wraps=self.manager.handlers[1].handle
        ) as spy_penalty_accruing, patch.object(
            self.manager.handlers[2], 'handle', wraps=self.manager.handlers[2].handle
        ) as spy_obligation_paid:

            self.manager.process_compliance_updates(invoice)

            # Verify only ObligationPaidHandler's handle method was called
            spy_penalty_paid.assert_not_called()
            spy_penalty_accruing.assert_not_called()
            spy_obligation_paid.assert_called_once_with(invoice)

        # Verify compliance status was updated
        self.compliance_report_version.refresh_from_db()
        assert self.compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

        # Verify penalty creation service was called
        mock_create_penalty.assert_called_once_with(self.obligation)
