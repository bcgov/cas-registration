from datetime import timedelta
from decimal import Decimal
from typing import Any, Dict
from django.http import HttpRequest
from django.utils import timezone
from compliance.models import (
    ComplianceEarnedCredit,
    ComplianceObligation,
    CompliancePenalty,
    ComplianceReportVersion,
    ElicensingClientOperator,
    ElicensingInvoice,
    ElicensingLineItem,
)
from rls.utils.manager import RlsManager
from ..schemas import ScenarioPayload
from .base import ScenarioHandler


class AutomaticOverduePenaltyScenario(ScenarioHandler):
    """
    Mutates DB state to simulate an overdue compliance obligation accruing
    automatic administrative penalties.
    """

    DEFAULT_DAYS_OVERDUE = 45
    DEFAULT_PENALTY_AMOUNT = "3800.00"

    @staticmethod
    def _get_line_item_fee_choice() -> str:
        """Inspects model field choices to dynamically return the valid 'fee' enum key."""
        field_choices = dict(ElicensingLineItem._meta.get_field("line_item_type").choices)
        return next(
            (key for key in field_choices if str(key).lower() == "fee"),
            "FEE",
        )

    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        crv_id = data.compliance_report_version_id or 2
        payload = data.payload or {}
        days_overdue = int(payload.get("days_overdue", self.DEFAULT_DAYS_OVERDUE))
        penalty_status = payload.get("penalty_status", ComplianceObligation.PenaltyStatus.ACCRUING)
        cap_reached = payload.get("cap_reached", False)
        fee_choice = self._get_line_item_fee_choice()

        with RlsManager.bypass_rls():
            # Clean up earned credits for this version
            ComplianceEarnedCredit.objects.filter(compliance_report_version_id=crv_id).delete()

            # Set report version status
            crv = ComplianceReportVersion.objects.get(id=crv_id)
            crv.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
            # Reset to an original report, since scenarios that make it supplementary share this version
            crv.is_supplementary = False
            crv.previous_version = None
            crv.save(update_fields=["status", "is_supplementary", "previous_version"])

            # Seed operator
            client_operator, _ = ElicensingClientOperator.objects.get_or_create(
                client_object_id=1,
                defaults={
                    "client_guid": "4242ea9d-b917-4129-93c2-db00b7451050",
                    "operator_id": "4242ea9d-b917-4129-93c2-db00b7451051",
                },
            )

            # Seed invoice with overdue date
            past_due_date = timezone.now().date() - timedelta(days=days_overdue)
            invoice, _ = ElicensingInvoice.objects.update_or_create(
                invoice_number="inv001",
                defaults={
                    "due_date": past_due_date,
                    "outstanding_balance": Decimal("1020000.00"),
                    "invoice_fee_balance": Decimal("1000000.00"),
                    "invoice_interest_balance": Decimal("20000.00"),
                    "is_void": False,
                    "last_refreshed": timezone.now(),
                    "elicensing_client_operator": client_operator,
                },
            )

            # Seed line item with model-validated choice
            ElicensingLineItem.objects.update_or_create(
                object_id=1,
                elicensing_invoice=invoice,
                defaults={
                    "guid": "4242ea9d-b917-4129-93c2-db00b7451052",
                    "fee_date": "2025-11-01",
                    "base_amount": Decimal("1000000.00"),
                    "line_item_type": fee_choice,
                },
            )

            # Seed / update compliance obligation
            obligation, _ = ComplianceObligation.objects.update_or_create(
                compliance_report_version_id=crv_id,
                defaults={
                    "obligation_id": 1,
                    "fee_amount_dollars": Decimal("1000000.00"),
                    "fee_date": "2025-11-01",
                    "penalty_status": penalty_status,
                    "invoice_number": "inv001",
                    "elicensing_invoice": invoice,
                },
            )

            # Seed penalty record when capped or marked unpaid
            penalty_invoice_number = None
            if cap_reached or penalty_status == ComplianceObligation.PenaltyStatus.NOT_PAID:
                penalty_amount = Decimal(str(payload.get("penalty_amount", self.DEFAULT_PENALTY_AMOUNT)))

                penalty, _ = CompliancePenalty.objects.update_or_create(
                    compliance_obligation=obligation,
                    penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
                    defaults={
                        "status": (
                            CompliancePenalty.Status.PAID
                            if penalty_status == ComplianceObligation.PenaltyStatus.PAID
                            else CompliancePenalty.Status.NOT_PAID
                        ),
                        "total_penalty_amount": penalty_amount,
                    },
                )

                if payload.get("penalty_invoice_number"):
                    penalty_invoice_number = str(payload["penalty_invoice_number"])
                    penalty_invoice, _ = ElicensingInvoice.objects.get_or_create(
                        invoice_number=penalty_invoice_number,
                        defaults={
                            "elicensing_client_operator": client_operator,
                            "due_date": timezone.now().date() + timedelta(days=30),
                            "outstanding_balance": (
                                Decimal("0.00")
                                if penalty_status == ComplianceObligation.PenaltyStatus.PAID
                                else penalty_amount
                            ),
                            "invoice_fee_balance": penalty_amount,
                            "is_void": False,
                            "last_refreshed": timezone.now(),
                        },
                    )
                    penalty.elicensing_invoice = penalty_invoice
                    penalty.save(update_fields=["elicensing_invoice"])

        return {
            "compliance_report_version_id": crv_id,
            "obligation_id": obligation.obligation_id,
            "penalty_status": obligation.penalty_status,
            "days_overdue": days_overdue,
            "cap_reached": cap_reached,
            "penalty_invoice_number": penalty_invoice_number,
        }