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
    """Tests for the ElicensingObligationService class"""

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
    def test_process_obligation_integration_success(self, mock_refresh, mock_create_invoice, mock_create_fees) -> None:
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
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId=1)],
        )

        mock_create_fees.return_value = mock_fee_response

        mock_invoice_response = TestInvoiceResponse(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response

        mock_refresh.return_value = None

        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Call the method
        ElicensingObligationService.process_obligation_integration(obligation.id)

        obligation.refresh_from_db()

        # Invoice has been assigned to obligation
        assert obligation.elicensing_invoice_id == invoice.id
