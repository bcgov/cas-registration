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
from compliance.enums import ComplianceInvoiceTypes
from compliance.dataclass import RefreshWrapperReturn


pytestmark = pytest.mark.django_db

ELICENSING_SERVICE_PATH = "compliance.service.elicensing"
ELICENSING_QUERY_INVOICE_PATH = f"{ELICENSING_SERVICE_PATH}.elicensing_api_client.ELicensingAPIClient.query_invoice"
ELICENSING_DATA_REFRESH_SERVICE = (
    f"{ELICENSING_SERVICE_PATH}.elicensing_data_refresh_service.ElicensingDataRefreshService"
)
ELICENSING_REFRESH_DATA_BY_INVOICE_PATH = f"{ELICENSING_DATA_REFRESH_SERVICE}.refresh_data_by_invoice"
ELICENSING_REFRESH_DATA_WRAPPER = (
    f"{ELICENSING_DATA_REFRESH_SERVICE}.refresh_data_wrapper_by_compliance_report_version_id"
)


@pytest.fixture
def mock_query_invoice():
    with patch(ELICENSING_QUERY_INVOICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_refresh_invoice():
    with patch(ELICENSING_REFRESH_DATA_BY_INVOICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_refresh_wrapper():
    with patch(ELICENSING_REFRESH_DATA_WRAPPER) as mock:
        yield mock


class TestElicensingOperatorService:
    """Tests for the ElicensingDataRefreshService class"""

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
                            receivedDate='2025-11-30',
                            depositDate='2025-11-30',
                            amount=Decimal('50.00'),
                            cashHandlingArea='1',
                            referenceNumber='1',
                            method='EFT/Wire - OBPS',
                            receiptNumber='R192883',
                        )
                    ],
                    adjustments=[
                        FeeAdjustment(
                            adjustmentObjectId=3,
                            adjustmentTotal=Decimal('10.11'),
                            amount=Decimal('10.11'),
                            date='2025-11-30',
                            reason=ElicensingAdjustment.Reason.COMPLIANCE_UNITS_APPLIED,
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
        assert payment.method == "EFT/Wire - OBPS"
        assert payment.receipt_number == 'R192883'
        assert adjustment.amount == Decimal('10.11')

    def test_compliance_report_version_id_wrapper_stale_data(self, mock_refresh_invoice):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(days=3)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        mock_refresh_invoice.side_effect = ValueError("Failed to parse API response")
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        assert returned_data.data_is_fresh == False  # noqa: E712
        assert returned_data.invoice == invoice

    def test_compliance_report_version_id_wrapper_successful_refresh(self, mock_refresh_invoice):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(days=3)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        mock_refresh_invoice.assert_called_once()
        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.invoice == invoice

    def test_compliance_report_version_id_wrapper_skips_refresh(self, mock_refresh_invoice):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(seconds=30)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        mock_refresh_invoice.assert_not_called()
        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.invoice == invoice

    def test_force_refresh_data(self, mock_refresh_invoice):
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now() - timedelta(minutes=300)
        )
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        returned_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id,
            force_refresh=True,  # should bypass last_refresh
        )
        mock_refresh_invoice.assert_called_once()
        assert returned_data.data_is_fresh == True  # noqa: E712
        # python

    def test_refresh_data_wrapper_by_compliance_report_version_id_obligation(self):
        # Create an obligation with an associated invoice
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now())
        obligation = make_recipe('compliance.tests.utils.compliance_obligation', elicensing_invoice=invoice)
        # Call with OBLIGATION type (default)
        result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id,
        )
        assert result.invoice == invoice

    def test_refresh_data_wrapper_by_compliance_report_version_id_penalty(self):
        # Create an obligation and a penalty, each with their own invoice
        penalty_invoice = make_recipe('compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now())
        obligation = make_recipe('compliance.tests.utils.compliance_obligation')
        # penalty
        make_recipe(
            'compliance.tests.utils.compliance_penalty',
            compliance_obligation=obligation,
            elicensing_invoice=penalty_invoice,
        )
        # Call with PENALTY type
        result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id,
            invoice_type=ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
        )
        assert result.invoice == penalty_invoice

    def test_wrapper_last_refreshed_metadata_fresh(mock_refresh_wrapper):
        # Arrange
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now())

        # Mocked wrapper result
        mock_refresh_wrapper.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=invoice)

        # Act
        metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(mock_refresh_wrapper.return_value)

        # Assert
        assert metadata["data_is_fresh"] is True
        assert metadata["last_refreshed_display"] == invoice.last_refreshed.strftime("%Y-%m-%d %H:%M:%S %Z")

    def test_wrapper_last_refreshed_metadata_stale(mock_refresh_wrapper):
        # Arrange
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', last_refreshed=timezone.now())

        # Mocked wrapper result
        mock_refresh_wrapper.return_value = RefreshWrapperReturn(data_is_fresh=False, invoice=invoice)

        # Act
        metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(mock_refresh_wrapper.return_value)

        # Assert
        assert metadata["data_is_fresh"] is False
        assert metadata["last_refreshed_display"] == invoice.last_refreshed.strftime("%Y-%m-%d %H:%M:%S %Z")

    def test_wrapper_last_refreshed_metadata_defaults(mock_refresh_wrapper):
        # Mocked wrapper result
        mock_refresh_wrapper.return_value = RefreshWrapperReturn(data_is_fresh=None, invoice=None)

        # Act
        metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(mock_refresh_wrapper.return_value)

        # Assert
        assert metadata["data_is_fresh"] is False
        assert metadata["last_refreshed_display"] == ""
