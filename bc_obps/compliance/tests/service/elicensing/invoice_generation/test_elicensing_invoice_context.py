from decimal import Decimal
from django.utils import timezone
import pytest
from unittest.mock import patch
from datetime import date
from model_bakery.baker import make_recipe

from compliance.service.elicensing.invoice_generation.elicensing_invoice_context import ElicensingInvoiceContextService
from reporting.models.report_operation import ReportOperation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from reporting.service.reporting_year_service import ReportingYearService

pytestmark = pytest.mark.django_db
MOCK_REPORTING_YEAR = date.today().year - 1


class TestElicensingInvoiceContextService:
    def setup_method(self):
        self.test_data = ComplianceTestHelper.build_test_data(
            reporting_year=ReportingYearService.get_current_reporting_year().reporting_year,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        self.test_data.invoice.due_date = date(2025, 8, 1)
        self.test_data.invoice.save()

        self.address = make_recipe("registration.tests.utils.address")

    def test_build_invoice_filename(self):
        expected_date = timezone.now().strftime("%Y%m%d")
        assert (
            ElicensingInvoiceContextService.build_invoice_filename("OBPS Compliance Invoice", "OBI706800")
            == f"OBPS Compliance Invoice OBI706800_{expected_date}.pdf"
        )

    @patch(
        "compliance.service.compliance_report_version_service.ComplianceReportVersionService.get_operator_by_compliance_report_version"
    )
    @patch(
        "compliance.service.compliance_report_version_service.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_calculator.ElicensingInvoiceCalculatorService.calculate_invoice_amount_due"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_context.ElicensingInvoiceContextService._format_operator_address"
    )
    def test_prepare_partial_invoice_context(
        self,
        mock_format_operator_address,
        mock_calculate_invoice_amount_due,
        mock_get_report_operation,
        mock_get_operator,
    ):
        # Arrange
        mock_format_operator_address.return_value = ("123 Main St", "City, BC  V1A 2B3")
        mock_calculate_invoice_amount_due.return_value = (
            Decimal('263512.40'),
            [
                {
                    'date': 'Aug 8, 2025',
                    'description': '2024 GGIRCA Automatic Penalty for Obligation ID 1',
                    'amount': '$1,263,512.40',
                },
                {'date': 'Aug 8, 2025', 'description': 'Payment 185262395', 'amount': '($1,000,000.00)'},
            ],
            None,
            None,
            None,
        )
        mock_get_report_operation.return_value = ReportOperation.objects.get(
            report_version=self.test_data.report_version
        )

        mock_get_operator.return_value = self.test_data.operation.operator

        obligation_id = self.test_data.compliance_obligation.obligation_id

        # Act
        context = ElicensingInvoiceContextService.prepare_partial_invoice_context(
            self.test_data.compliance_report_version.id,
            self.test_data.compliance_obligation.elicensing_invoice,
            obligation_id,
        )

        # Assert
        assert context["operator_name"] == self.test_data.operation.operator.legal_name
        assert context["operator_address_line1"] == "123 Main St"
        assert context["operator_address_line2"] == "City, BC  V1A 2B3"
        assert (
            context["operation_name"]
            == ReportOperation.objects.get(report_version=self.test_data.report_version).operation_name
        )
        assert context["invoice_number"] == self.test_data.compliance_obligation.elicensing_invoice.invoice_number
        assert context["invoice_due_date"] == self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime(
            "%b %-d, %Y"
        )
        assert context["invoice_printed_date"] == timezone.now().strftime("%b %-d, %Y")
        assert "logo_base64" in context

        assert context["billing_items"] == [
            {
                'date': 'Aug 8, 2025',
                'description': '2024 GGIRCA Automatic Penalty for Obligation ID 1',
                'amount': '$1,263,512.40',
            },
            {'date': 'Aug 8, 2025', 'description': 'Payment 185262395', 'amount': '($1,000,000.00)'},
        ]
        assert context["total_amount_due"] == '$263,512.40'
        assert context["compliance_obligation_id"] == obligation_id
