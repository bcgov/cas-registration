from unittest.mock import patch
from compliance.models import ElicensingLineItem, ElicensingInvoice, ElicensingPayment, ElicensingAdjustment
from compliance.service.elicensing.elicensing_data_refresh_service import (
    ElicensingDataRefreshService,
)
from compliance.service.elicensing.schema import InvoiceQueryResponse, InvoiceFee, Payment, FeeAdjustment
from decimal import Decimal

import pytest
from model_bakery.baker import make_recipe
from django.utils import timezone
from datetime import timedelta


class TestElicensingOperatorService:
    """Tests for the ElicensingDataRefreshService class"""

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.query_invoice')
    def test_refreshes_data_from_elicensing(self, mock_query_invoice):
        """Test sync_client_with_elicensing successfully creates a new client"""
        # Setup mocks
        client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')

        # Setup successful API call
        mock_inv = InvoiceQueryResponse(
            clientObjectId=client_operator.client_object_id,
            clientGUID="00000000-0000-0000-0000-000000000000",
            invoiceNumber="inv-001",
            invoicePaymentDueDate="2025-11-30",
            invoiceOutstandingBalance=Decimal('100.00'),
            invoiceFeeBalance=Decimal('100.00'),
            invoiceInterestBalance=Decimal('0.00'),
            fees=[
                InvoiceFee(
                    feeObjectId=1,
                    feeGUID="00000000-0000-0000-0000-000000000000",
                    businessAreaCode='asdf',
                    feeDate="2025-11-30",
                    description="desc",
                    baseAmount=Decimal('0'),
                    taxTotal=Decimal('0'),
                    adjustmentTotal=Decimal('0'),
                    taxAdjustmentTotal=Decimal('0'),
                    paymentBaseAmount=Decimal('0'),
                    paymentTotal=Decimal('0'),
                    invoiceNumber="inv-001",
                    payments=[
                        Payment(
                            paymentObjectId=2,
                            receiptNumber='str',
                            receivedDate='2025-11-30',
                            depositDate='2025-11-30',
                            amount=Decimal('50.00'),
                            method='method',
                            cashHandlingArea='1',
                            referenceNumber='1',
                        )
                    ],
                    adjustments=[
                        FeeAdjustment(
                            adjustmentObjectId=3,
                            adjustmentTotal=Decimal('10.11'),
                            amount=Decimal('10.11'),
                            date='2025-11-30',
                            reason='reason',
                            type='adj',
                        )
                    ],
                )
            ],
        )

        mock_query_invoice.return_value = mock_inv

        # Call the method
        ElicensingDataRefreshService.refresh_data_by_invoice(
            client_operator_id=client_operator.id, invoice_number="inv-001"
        )

        # Assert record creation successful & accurate
        invoice = ElicensingInvoice.objects.get(invoice_number='inv-001')
        fee = ElicensingLineItem.objects.get(elicensing_invoice=invoice)
        payment = ElicensingPayment.objects.get(elicensing_line_item=fee)
        adjustment = ElicensingAdjustment.objects.get(elicensing_line_item=fee)
        assert invoice.outstanding_balance == 100.00
        assert fee.object_id == 1
        assert fee.description == 'desc'
        assert payment.amount == Decimal('50')
        assert adjustment.amount == Decimal('10.11')

    @pytest.mark.django_db
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    def test_compliance_report_version_id_wrapper_stale_data(self, mock_refresh):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(days=3)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        mock_refresh.side_effect = ValueError("Failed to parse API response")
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        assert returned_data.data_is_fresh == False  # noqa: E712
        assert returned_data.invoice == invoice

    @pytest.mark.django_db
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    def test_compliance_report_version_id_wrapper_successful_refresh(self, mock_refresh):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(days=3)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        mock_refresh.assert_called_once()
        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.invoice == invoice

    @pytest.mark.django_db
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    def test_compliance_report_version_id_wrapper_skips_refresh(self, mock_refresh):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(seconds=30)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        mock_refresh.assert_not_called()
        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.invoice == invoice

    @pytest.mark.django_db
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    def test_force_refresh_data(self, mock_refresh):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(minutes=300)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id,
            force_refresh=True,  # should bypass last_refresh
        )
        mock_refresh.assert_to_be_called()
        assert returned_data.data_is_fresh == True  # noqa: E712
