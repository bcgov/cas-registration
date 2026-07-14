import uuid
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
import pytest
from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper

# ------------------------------
# Patch target paths
# ------------------------------

COMPLIANCE_SERVICE_PATH = "compliance.service"
COMPLIANCE_ADJUSTMENT_SERVICE_PATH = f"{COMPLIANCE_SERVICE_PATH}.compliance_adjustment_service"
ELICENSING_BASE_PATH = f"{COMPLIANCE_SERVICE_PATH}.elicensing"

# Methods in ComplianceAdjustmentService
TRANSACTION_PATH = f"{COMPLIANCE_ADJUSTMENT_SERVICE_PATH}.transaction"

# Methods in Elicensing services
ELICENSING_REFRESH_DATA_BY_COMPLIANCE_REPORT_VERSION_ID_PATH = (
    f"{ELICENSING_BASE_PATH}.elicensing_data_refresh_service."
    "ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
)
ELICENSING_ADJUST_FEES_PATH = f"{ELICENSING_BASE_PATH}.elicensing_api_client.ELicensingAPIClient.adjust_fees"

# Retryable task
RETRYABLE_CREATE_ADJUSTMENT_PATH = "compliance.tasks.retryable_create_adjustment"


@pytest.fixture
def mock_transaction():
    with patch(TRANSACTION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_create_adjustment():
    with patch(RETRYABLE_CREATE_ADJUSTMENT_PATH) as mock:
        yield mock


@pytest.fixture
def mock_refresh_data_wrapper():
    with patch(ELICENSING_REFRESH_DATA_BY_COMPLIANCE_REPORT_VERSION_ID_PATH) as mock:
        yield mock


@pytest.fixture
def mock_adjust_fees():
    with patch(ELICENSING_ADJUST_FEES_PATH) as mock:
        yield mock


pytestmark = pytest.mark.django_db


class TestComplianceAdjustmentService:
    """Tests for the ComplianceAdjustmentService class"""

    def test_create_adjustment(self, mock_adjust_fees, mock_refresh_data_wrapper):
        """Test successful creation of a compliance adjustment"""

        # Set up
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
        )
        test_data.invoice.elicensing_client_operator_id = client_operator.id
        test_data.invoice.save()

        mock_response = {
            'adjustments': [
                {
                    'adjustmentGUID': '60196767-2433-4f19-a526-65097d5b324e',
                    'adjustmentObjectId': 999,
                    'feeGUID': '',
                    'feeObjectId': 9999,
                }
            ],
            'clientObjectId': client_operator.client_object_id,
        }
        mock_adjust_fees.return_value = mock_response

        # API call
        ComplianceAdjustmentService.create_adjustment(
            compliance_report_version_id=test_data.compliance_report_version.id, adjustment_total=Decimal('160')
        )

        # Assertions
        mock_adjust_fees.assert_called_once()
        call_args = mock_adjust_fees.call_args
        assert call_args[0][0] == client_operator.client_object_id

        request_body = call_args[0][1]
        assert "adjustments" in request_body
        assert len(request_body["adjustments"]) == 1
        adjustment = request_body["adjustments"][0]

        assert adjustment["feeObjectId"] == test_data.fee.object_id
        assert uuid.UUID(adjustment["adjustmentGUID"], version=4)
        assert adjustment["adjustmentTotal"] == Decimal("160.0")
        assert adjustment["reason"] == "Compliance Units Applied"
        assert adjustment["type"] == "Adjustment"

        mock_refresh_data_wrapper.assert_called_once_with(
            compliance_report_version_id=test_data.compliance_report_version.id,
            force_refresh=True,
            supplementary_compliance_report_version_id=None,
        )

    def test_create_adjustment_api_failure(self, mock_adjust_fees):
        """Test handling of API failure when creating adjustment"""
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
        )
        test_data.invoice.elicensing_client_operator_id = client_operator.id
        test_data.invoice.save()

        mock_adjust_fees.side_effect = Exception("API connection error")

        with pytest.raises(ValueError) as excinfo:
            ComplianceAdjustmentService.create_adjustment(
                compliance_report_version_id=test_data.compliance_report_version.id, adjustment_total=Decimal('160')
            )

        assert "Failed to adjust fees" in str(excinfo.value)

        mock_adjust_fees.assert_called_once()

    def test_create_adjustment_no_invoice(self):
        """Test handling of missing invoice when creating adjustment"""
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        with pytest.raises(ValueError) as excinfo:
            ComplianceAdjustmentService.create_adjustment(
                compliance_report_version_id=test_data.compliance_report_version.id, adjustment_total=Decimal('160')
            )

        assert "No elicensing invoice found" in str(excinfo.value)

    def test_create_adjustment_for_current_version(self, mock_transaction, mock_retryable_create_adjustment):
        """Queues retryable adjustment via transaction.on_commit for the current version."""

        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        amount = Decimal("160")

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Act
        ComplianceAdjustmentService.create_adjustment_for_current_version(
            compliance_report_version_id=test_data.compliance_report_version.id,
            adjustment_total=amount,
        )

        # Assert
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_create_adjustment.execute.assert_called_once_with(
            compliance_report_version_id=test_data.compliance_report_version.id,
            adjustment_total=amount,
        )

    def test_create_adjustment_for_current_version_does_not_trigger_on_rollback(
        self,
        mock_retryable_create_adjustment,
        mock_transaction,
    ):
        # Arrange: simulate rollback by NOT invoking the callback
        def _swallow(cb):
            return None

        mock_transaction.on_commit.side_effect = _swallow

        # Act
        ComplianceAdjustmentService.create_adjustment_for_current_version(
            compliance_report_version_id=999,
            adjustment_total=Decimal("-1.00"),
        )

        # Assert: on_commit was registered, but execute was never run
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_create_adjustment.execute.assert_not_called()

    def test_create_adjustment_for_target_version_supplementary_report(
        self, mock_transaction, mock_retryable_create_adjustment
    ):
        """Queues retryable adjustment via transaction.on_commit."""

        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_supp_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
            previous_data=test_data,
        )
        amount = Decimal("160")
        reason = ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Act
        ComplianceAdjustmentService.create_adjustment_for_target_version(
            target_compliance_report_version_id=test_data.compliance_report_version.id,
            adjustment_total=amount,
            supplementary_compliance_report_version_id=test_supp_data.compliance_report_version.id,
            reason=reason,
        )

        # Assert
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_create_adjustment.execute.assert_called_once_with(
            compliance_report_version_id=test_data.compliance_report_version.id,
            adjustment_total=amount,
            supplementary_compliance_report_version_id=test_supp_data.compliance_report_version.id,
            reason=reason,
            adjustment_date=None,
        )

    def test_create_adjustment_for_target_version_does_not_trigger_on_rollback(
        self,
        mock_retryable_create_adjustment,
        mock_transaction,
    ):
        # Arrange: simulate rollback by NOT invoking the callback
        def _swallow(cb):
            # pretend the transaction rolled back; do nothing
            return None

        mock_transaction.on_commit.side_effect = _swallow

        # Act
        ComplianceAdjustmentService.create_adjustment_for_target_version(
            target_compliance_report_version_id=999,
            adjustment_total=Decimal("-1.00"),
            supplementary_compliance_report_version_id=888,
            reason=None,
        )

        # Assert: on_commit was registered, but execute was never run
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_create_adjustment.execute.assert_not_called()
