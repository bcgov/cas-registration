from django.test import TestCase
from compliance.models import ELicensingLink, ComplianceObligation
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
import pytest
from model_bakery import baker
from unittest.mock import patch
from registration.models import Operator
from django.contrib.contenttypes.models import ContentType
from decimal import Decimal
from dataclasses import dataclass


@dataclass
class TestInvoiceQueryResponse:
    invoiceOutstandingBalance: Decimal


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""

    @pytest.mark.django_db
    # @patch('compliance.service.compliance_obligation_service.ComplianceObligation.objects.create')
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.query_fees')
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.query_invoice')
    def test_get_payments_for_dashboard(self, mock_query_invoice, mock_query_fees):
        """Test successful creation of a compliance obligation"""
        obligation_1 = baker.make_recipe('compliance.tests.utils.compliance_obligation', obligation_id="21-0001-1-1")
        user = baker.make_recipe('registration.tests.utils.industry_operator_user')

        operator_id = obligation_1.compliance_report_version.compliance_report.report.operator_id

        baker.make_recipe(
            'registration.tests.utils.user_operator', user_id=user.user_guid, operator_id=operator_id, status='Approved'
        )

        # Create client link
        baker.make_recipe(
            'compliance.tests.utils.elicensing_link',
            content_type=ContentType.objects.get_for_model(Operator),
            elicensing_object_id='client1',
            object_id=str(operator_id),
        )

        obligation_1_fee_link = baker.make_recipe(
            'compliance.tests.utils.elicensing_link',
            content_type=ContentType.objects.get_for_model(ComplianceObligation),
            elicensing_object_id='fee1',
            elicensing_object_kind=ELicensingLink.ObjectKind.FEE,
            object_id=str(obligation_1.id),
        )

        mock_query_fees.return_value = {
            "fees": [
                {
                    "feeObjectId": obligation_1_fee_link.elicensing_object_id,
                    "invoiceNumber": "invoice-123",
                    "payments": [
                        {"paymentObjectId": 1, "amount": 100.01},
                        {"paymentObjectId": 2, "amount": 200.02},
                        {"paymentObjectId": 3, "amount": 300.03},
                    ],
                }
            ]
        }
        invoice_data = {"invoiceOutstandingBalance": 500.05}
        mock_query_invoice.return_value = TestInvoiceQueryResponse(**invoice_data)

        response = ComplianceDashboardService.get_payments_for_dashboard(user)

        assert response.row_count == 3
        assert response.rows[0].operation_name == 'Operation 01'
        assert response.rows[0].payment_amount == 100.01
        assert response.rows[1].payment_amount == 200.02
        assert response.rows[2].payment_amount == 300.03
        assert response.rows[0].outstanding_balance == 500.05
