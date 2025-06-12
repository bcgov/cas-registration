from unittest.mock import patch
from compliance.models import ElicensingLineItem, ElicensingInvoice, ElicensingPayment, ElicensingAdjustment
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.elicensing.schema import InvoiceQueryResponse, InvoiceFee, Payment, FeeAdjustment
from decimal import Decimal

import pytest
from model_bakery.baker import make_recipe


class TestOperatorELicensingService:
    """Tests for the ElicensingDataRefreshService class"""

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.query_invoice')
    def test_refreshes_data_from_elicensing(self, mock_query_invoice):
        """Test sync_client_with_elicensing successfully creates a new client"""
        # Setup mocks
        client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')

        # Setup successful API call
        mock_inv = InvoiceQueryResponse(
          clientObjectId = client_operator.client_object_id,
          clientGUID = "00000000-0000-0000-0000-000000000000",
          invoiceNumber = "inv-001",
          invoiceDueDate = "2025-11-30",
          invoiceOutstandingBalance = Decimal('100.00'),
          invoiceFeeBalance = Decimal('100.00'),
          invoiceInterestBalance = Decimal('0.00'),
          fees = [
            InvoiceFee(
              feeObjectId = 1,
              feeGUID = "00000000-0000-0000-0000-000000000000",
              businessAreaCode = 'asdf',
              feeDate = "2025-11-30",
              description = "desc",
              baseAmount = Decimal('0'),
              taxTotal = Decimal('0'),
              adjustmentTotal = Decimal('0'),
              taxAdjustmentTotal = Decimal('0'),
              paymentBaseAmount = Decimal('0'),
              paymentTotal = Decimal('0'),
              invoiceNumber= "inv-001",
              payments = [
                Payment(
                    paymentObjectId=2,
                    receiptNumber='str',
                    receivedDate='2025-11-30',
                    depositDate='2025-11-30',
                    amount = Decimal('50.00'),
                    method = 'method',
                    cashHandlingArea='1',
                    referenceNumber='1'
                )
              ],
              adjustments = [
                  FeeAdjustment(
                      adjustmentObjectId = 3,
                      adjustmentTotal = Decimal('10.11'),
                      amount = Decimal('10.11'),
                      date = '2025-11-30',
                      reason = 'reason',
                      type = 'adj'
                  )
              ]
            )
          ]
        )

        mock_query_invoice.return_value = mock_inv

        # Call the method
        ElicensingDataRefreshService.refresh_data_by_invoice(client_operator_id = client_operator.id, invoice_number="inv-001")

        # Assert record creation successful & accurate
        invoice = ElicensingInvoice.objects.get(invoice_number='inv-001')
        fee = ElicensingLineItem.objects.get(elicensing_invoice=invoice)
        payment = ElicensingPayment.objects.get(elicensing_line_item=fee)
        adjustment = ElicensingAdjustment.objects.get(elicensing_line_item=fee)
        assert invoice.outstanding_balance == 100.00
        assert fee.object_id==1
        assert payment.amount==Decimal('50')
        assert adjustment.amount==Decimal('10.11')



