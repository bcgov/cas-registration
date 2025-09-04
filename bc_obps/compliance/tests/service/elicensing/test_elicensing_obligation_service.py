from unittest.mock import patch, MagicMock
import uuid
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from datetime import date
from decimal import Decimal
import pytest
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_period import CompliancePeriod
from reporting.models.reporting_year import ReportingYear
from registration.models.operation import Operation
from registration.models.operator import Operator
from model_bakery.baker import make_recipe
from compliance.service.elicensing.schema import FeeResponse, FeeItem
from dataclasses import dataclass

pytestmark = pytest.mark.django_db


@dataclass
class TestInvoiceResponse:
    invoiceNumber: str


@pytest.fixture
def mock_obligation() -> MagicMock:
    """Mock a ComplianceObligation object"""
    obligation = MagicMock(spec=ComplianceObligation)
    obligation.id = 1
    obligation.fee_amount_dollars = Decimal('1000.00')
    obligation.fee_date = date(2024, 1, 1)
    obligation.obligation_deadline = date(2024, 12, 31)

    # Mock compliance report_version
    mock_compliance_report_version = MagicMock(spec=ComplianceReportVersion)
    mock_period = MagicMock(spec=CompliancePeriod)
    mock_year = MagicMock(spec=ReportingYear)
    mock_year.reporting_year = 2024
    mock_period.reporting_year = mock_year
    mock_compliance_report_version.compliance_report.compliance_period = mock_period

    # Mock operation and operator
    mock_operation = MagicMock(spec=Operation)
    mock_operator = MagicMock(spec=Operator)
    mock_operator.id = uuid.uuid4()
    mock_operation.operator = mock_operator
    mock_compliance_report_version.compliance_report.report.operation = mock_operation

    obligation.compliance_report_version = mock_compliance_report_version
    return obligation


class TestElicensingObligationService:
    def test_map_obligation_to_fee_data(self, mock_obligation: MagicMock) -> None:
        """Test mapping obligation data to fee data"""
        result = ElicensingObligationService._map_obligation_to_fee_data(mock_obligation)

        assert "businessAreaCode" in result
        assert result["businessAreaCode"] == "OBPS"
        assert "feeGUID" in result
        assert result["feeProfileGroupName"] == "OBPS Compliance Obligation"
        assert result["feeDescription"] == "2024 GGIRCA Compliance Obligation"
        assert result["feeAmount"] == Decimal('1000.00')
        assert result["feeDate"] == "2024-01-01"

    def test_map_obligation_to_invoice_data(self, mock_obligation: MagicMock) -> None:
        """Test mapping obligation data to invoice data"""
        fee_id = "test-fee-id"
        result = ElicensingObligationService._map_obligation_to_invoice_data(mock_obligation, fee_id)

        assert result["paymentDueDate"] == "2024-12-31"
        assert result["businessAreaCode"] == "OBPS"
        assert result["fees"] == [fee_id]

    @pytest.mark.django_db
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.create_fees')
    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.create_invoice')
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_by_invoice'
    )
    @patch(
        'compliance.service.compliance_report_version_service.ComplianceReportVersionService.update_compliance_status'
    )
    def test_process_obligation_integration_success(
        self, mock_update_status, mock_refresh, mock_create_invoice, mock_create_fees
    ) -> None:
        """Test successful full obligation integration process"""
        # Setup mocks

        obligation = make_recipe('compliance.tests.utils.compliance_obligation')
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator_id=obligation.compliance_report_version.compliance_report.report.operator_id,
        )

        # Setup API responses
        mock_fee_response = FeeResponse(
            clientObjectId=client_operator.client_object_id,
            clientGUID=client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response

        mock_invoice_response = TestInvoiceResponse(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response

        mock_refresh.return_value = None
        mock_update_status.return_value = None

        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Call the method
        ElicensingObligationService.process_obligation_integration(obligation.id)

        obligation.refresh_from_db()

        # Invoice has been assigned to obligation
        assert obligation.elicensing_invoice_id == invoice.id

        mock_update_status.assert_called_once_with(obligation.compliance_report_version)

    @patch('compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.create_fees')
    @patch(
        'compliance.service.elicensing.elicensing_operator_service.ElicensingOperatorService.sync_client_with_elicensing'
    )
    def test_process_obligation_integration_failure_sets_pending_status(
        self, mock_sync_client, mock_create_fees
    ) -> None:
        obligation = make_recipe('compliance.tests.utils.compliance_obligation')
        compliance_report_version = obligation.compliance_report_version
        mock_client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')
        mock_sync_client.return_value = mock_client_operator

        # Set initial status
        compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        compliance_report_version.save()

        # Mock create_fees to raise an exception
        mock_create_fees.side_effect = Exception("API Error")

        with pytest.raises(Exception, match="API Error"):
            ElicensingObligationService.process_obligation_integration(obligation.id)

        compliance_report_version.refresh_from_db()
        assert (
            compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )

    @patch('compliance.tasks.retryable_process_obligation_integration')
    @patch('compliance.service.elicensing.elicensing_obligation_service.transaction')
    @patch('compliance.service.elicensing.elicensing_obligation_service.timezone')
    def test_handle_obligation_integration_runs_when_invoice_generation_date_passed(
        self, mock_timezone, mock_transaction, mock_retryable_integration
    ):
        # Arrange
        mock_timezone.now.return_value.date.return_value = date(2025, 11, 15)  # After Nov 1, 2025

        obligation = make_recipe('compliance.tests.utils.compliance_obligation')
        compliance_period = make_recipe(
            'compliance.tests.utils.compliance_period', invoice_generation_date=date(2025, 11, 1)
        )

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Act
        ElicensingObligationService.handle_obligation_integration(obligation.id, compliance_period)

        # Assert
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_integration.execute.assert_called_once_with(obligation.id)

    @patch('compliance.service.elicensing.elicensing_obligation_service.timezone')
    def test_handle_obligation_integration_sets_pending_status_when_invoice_generation_date_not_passed(
        self, mock_timezone
    ):
        # Arrange
        mock_timezone.now.return_value.date.return_value = date(2025, 10, 15)  # Before Nov 1, 2025

        obligation = make_recipe('compliance.tests.utils.compliance_obligation')
        compliance_period = make_recipe(
            'compliance.tests.utils.compliance_period', invoice_generation_date=date(2025, 11, 1)
        )

        # Set initial status
        obligation.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        obligation.compliance_report_version.save()

        # Act
        ElicensingObligationService.handle_obligation_integration(obligation.id, compliance_period)

        # Assert
        obligation.compliance_report_version.refresh_from_db()
        assert (
            obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
