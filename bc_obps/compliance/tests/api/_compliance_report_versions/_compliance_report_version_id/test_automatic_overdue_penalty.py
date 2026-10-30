from datetime import date
from decimal import Decimal
from django.utils import timezone
from compliance.models.compliance_penalty_rate import CompliancePenaltyRate
from compliance.models.compliance_penalty import CompliancePenalty
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestAutomaticOverduePenaltyEndpoint(CommonTestSetup):
    def test_get_automatic_overdue_penalty_success(self):
        # Arrange
        CompliancePenaltyRate.objects.filter(is_current_rate=True).delete()
        make_recipe("compliance.tests.utils.compliance_penalty_rate", is_current_rate=True)

        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=operator,
            compliance_report__report__operator=operator,
        )
        elicensing_client_operator = make_recipe("compliance.tests.utils.elicensing_client_operator", operator=operator)
        obligation_invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice", elicensing_client_operator=elicensing_client_operator
        )
        obligation = make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=compliance_report_version,
            elicensing_invoice=obligation_invoice,
        )
        penalty_invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            elicensing_client_operator=elicensing_client_operator,
            invoice_number="AUTO-PENALTY-001",
            due_date=date(2025, 11, 30),
            last_refreshed=timezone.now(),
            invoice_interest_balance=Decimal("0.00"),
        )
        make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=obligation,
            elicensing_invoice=penalty_invoice,
            invoice_number=penalty_invoice.invoice_number,
            penalty_amount=Decimal("38656.43"),
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )
        TestUtils.generate_operation_operator_timeline(
            operator=operator, operations=[compliance_report_version.compliance_report.report.operation]
        )

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_automatic_overdue_penalty", kwargs={"compliance_report_version_id": compliance_report_version.id}
            ),
        )

        # Assert
        assert response.status_code == 200, response.content
        response_data = response.json()

        # Verify the response structure and data matches AutomaticOverduePenaltyOut schema
        assert response_data["penalty_status"] == "Not Paid"  # resolver makes this title case
        assert response_data["penalty_type"] == "Automatic Overdue"
        assert response_data["penalty_charge_rate"] == "0.38"
        assert response_data["total_penalty"] == "38656.43"
        assert response_data["faa_interest"] == "0.00"
        assert response_data["total_amount"] == "38656.43"
        assert response_data["due_date"] == penalty_invoice.due_date.isoformat()
        assert response_data["invoice_number"] == penalty_invoice.invoice_number
