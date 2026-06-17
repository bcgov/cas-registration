from unittest.mock import patch, MagicMock
import uuid
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_period import CompliancePeriod
from reporting.models.reporting_year import ReportingYear
from model_bakery.baker import make_recipe
from compliance.service.elicensing.schema import FeeResponse, FeeItem
from dataclasses import dataclass
from compliance.service.elicensing.elicensing_api_client import InvoiceCreationRequest

pytestmark = pytest.mark.django_db

ELICENSING_OBLIGATION_SERVICE_PATH = "compliance.service.elicensing.elicensing_obligation_service"
TIMEZONE_PATH = f"{ELICENSING_OBLIGATION_SERVICE_PATH}.timezone"
TRANSACTION_PATH = f"{ELICENSING_OBLIGATION_SERVICE_PATH}.transaction"
ELICENSING_OBLIGATION_SERVICE = (
    "compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService"
)
IS_TODAY_PATH = f"{ELICENSING_OBLIGATION_SERVICE}._is_invoice_generation_date_today"
GET_OBLIGATIONS_FOR_INVOICE_PATH = f"{ELICENSING_OBLIGATION_SERVICE}._get_obligations_for_invoice_generation"
GET_OBLIGATIONS_FOR_REMINDERS_PATH = f"{ELICENSING_OBLIGATION_SERVICE}._get_obligations_for_reminders"
HANDLE_INTEGRATION_PATH = f"{ELICENSING_OBLIGATION_SERVICE}.handle_obligation_integration"

ELICENSING_API_SERVICE = "compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient"
ELICENSING_CREATE_FEES_PATH = f"{ELICENSING_API_SERVICE}.create_fees"
ELICENSING_CREATE_INVOICE_PATH = f"{ELICENSING_API_SERVICE}.create_invoice"

GET_CURRENT_YEAR_PATH = "service.reporting_year_service.ReportingYearService.get_current_reporting_year"

REFRESH_DATA_SERVICE = f"{ELICENSING_OBLIGATION_SERVICE_PATH}.ElicensingDataRefreshService"
REFRESH_DATA_PATH = f"{REFRESH_DATA_SERVICE}.refresh_data_wrapper_by_compliance_report_version_id"
REFRESH_DATA_BY_INVOICE_PATH = f"{REFRESH_DATA_SERVICE}.refresh_data_by_invoice"

RETRYABLE_OBLIGATION_INTEGRATION_PATH = "compliance.tasks.retryable_process_obligation_integration"

OBLIGATION_DUE_EMAIL_PATH = 'compliance.tasks.retryable_send_notice_of_obligation_due_email'

PAST_DEADLINE_EMAIL_PATH = 'compliance.tasks.retryable_notice_of_supplementary_report_post_deadline_increases_emissions'

SYNC_WITH_ELICENSING_PATH = (
    f"{ELICENSING_OBLIGATION_SERVICE_PATH}.ElicensingOperatorService.sync_client_with_elicensing"
)

UPDATE_COMPLIANCE_STATUS_PATH = (
    "compliance.service.compliance_report_version_service.ComplianceReportVersionService.update_compliance_status"
)


RETRYABLE_OBLIGATION_DUE_EXECUTE_PATH = "compliance.tasks.retryable_send_reminder_of_obligation_due_email.execute"
RETRYABLE_PENALTY_ACCRUAL_EXECUTE_PATH = "compliance.tasks.retryable_send_notice_of_penalty_accrual_email.execute"


@pytest.fixture
def mock_timezone():
    with patch(TIMEZONE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_transaction():
    with patch(TRANSACTION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_is_today():
    with patch(IS_TODAY_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_obligations_for_invoice():
    with patch(GET_OBLIGATIONS_FOR_INVOICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_obligations_for_reminders():
    with patch(GET_OBLIGATIONS_FOR_REMINDERS_PATH) as mock:
        yield mock


@pytest.fixture
def mock_handle_integration():
    with patch(HANDLE_INTEGRATION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_fees():
    with patch(ELICENSING_CREATE_FEES_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_invoice():
    with patch(ELICENSING_CREATE_INVOICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_year():
    with patch(GET_CURRENT_YEAR_PATH) as mock:
        yield mock


@pytest.fixture
def mock_refresh():
    with patch(REFRESH_DATA_PATH) as mock:
        yield mock


@pytest.fixture
def mock_refresh_by_invoice():
    with patch(REFRESH_DATA_BY_INVOICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_integration():
    with patch(RETRYABLE_OBLIGATION_INTEGRATION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_obligation_due_email():
    with patch(OBLIGATION_DUE_EMAIL_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_notice_of_supplementary_report_post_deadline_increases_emissions():
    with patch(PAST_DEADLINE_EMAIL_PATH) as mock:
        yield mock


@pytest.fixture
def mock_update_status():
    with patch(UPDATE_COMPLIANCE_STATUS_PATH) as mock:
        yield mock


@pytest.fixture
def mock_sync_client():
    with patch(SYNC_WITH_ELICENSING_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_current_reporting_year():
    with patch(GET_CURRENT_YEAR_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_send_reminder_of_obligation_email():
    with patch(RETRYABLE_OBLIGATION_DUE_EXECUTE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_retryable_penalty_accrual_execute():
    with patch(RETRYABLE_PENALTY_ACCRUAL_EXECUTE_PATH) as mock:
        yield mock


@dataclass
class InvoiceResponseStub:
    invoiceNumber: str


@pytest.fixture
def make_obligation() -> ComplianceObligation:
    test_data = ComplianceTestHelper.build_test_data(
        reporting_year=2024,
        crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        create_invoice_data=True,
    )
    """Edit a ComplianceObligation object"""
    test_data.compliance_obligation.fee_amount_dollars = Decimal('1000.00')
    test_data.compliance_obligation.fee_date = date(2024, 1, 1)
    test_data.compliance_obligation.save()

    return test_data.compliance_obligation


def _make_obligation_for_period(
    cp: CompliancePeriod,
) -> ComplianceObligation:
    test_data = ComplianceTestHelper.build_test_data(
        reporting_year=2024,
        crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        create_invoice_data=True,
    )
    test_data.compliance_period = cp

    """Create an obligation tied to cp that satisfies the reminders base."""
    test_data.compliance_report.compliance_period = cp
    test_data.compliance_report.save()
    return test_data.compliance_obligation


class _FauxQueryset(list):
    def exists(self):
        return bool(self)


class TestElicensingObligationService:
    def _set_vancouver_today(self, mock_timezone, d: date) -> None:
        """Helper to mock Vancouver timezone's 'today' date."""
        mock_dt = MagicMock()
        mock_dt.astimezone.return_value.date.return_value = d
        mock_timezone.now.return_value = mock_dt

    def test_map_obligation_to_fee_data(self, make_obligation: ComplianceObligation) -> None:
        """Test mapping obligation data to fee data"""
        result = ElicensingObligationService._map_obligation_to_fee_data(make_obligation)

        assert "businessAreaCode" in result
        assert result["businessAreaCode"] == "OBPS"
        assert "feeGUID" in result
        assert result["feeProfileGroupName"] == "OBPS Compliance Obligation"
        assert result["feeDescription"] == "2024 GGIRCA Compliance Obligation"
        assert result["feeAmount"] == Decimal('1000.00')
        assert result["feeDate"] == "2024-01-01"

    def test_map_obligation_to_invoice_data(self, make_obligation: ComplianceObligation) -> None:
        """Test mapping obligation data to invoice data"""
        fee_id = "test-fee-id"
        result = ElicensingObligationService._map_obligation_to_invoice_data(make_obligation, fee_id)

        assert result["paymentDueDate"] == "2025-11-30"
        assert result["businessAreaCode"] == "OBPS"
        assert result["fees"] == [fee_id]

    def test_process_obligation_integration_success_before_deadline(
        self,
        mock_transaction,
        mock_update_status,
        mock_refresh_by_invoice,
        mock_create_invoice,
        mock_create_fees,
        mock_retryable_obligation_due_email,
        mock_retryable_notice_of_supplementary_report_post_deadline_increases_emissions,
        mock_timezone,
    ) -> None:
        """Test successful full obligation integration process"""
        # Setup mocks
        self._set_vancouver_today(mock_timezone, date(2025, 11, 30))
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator_id=test_data.compliance_obligation.compliance_report_version.compliance_report.report.operator_id,
        )

        # Setup API responses
        mock_fee_response = FeeResponse(
            clientObjectId=client_operator.client_object_id,
            clientGUID=client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response

        mock_invoice_response = InvoiceResponseStub(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response

        mock_refresh_by_invoice.return_value = None
        mock_update_status.return_value = None

        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Call the method
        ElicensingObligationService.process_obligation_integration(test_data.compliance_obligation.id)

        test_data.compliance_obligation.refresh_from_db()

        # Invoice has been assigned to obligation
        assert test_data.compliance_obligation.elicensing_invoice_id == invoice.id

        mock_update_status.assert_called_once_with(test_data.compliance_obligation.compliance_report_version)
        mock_retryable_obligation_due_email.execute.assert_called_once_with(test_data.compliance_obligation.pk)
        mock_retryable_notice_of_supplementary_report_post_deadline_increases_emissions.execute.assert_not_called()

    def test_process_obligation_integration_success_after_deadline(
        self,
        mock_transaction,
        mock_update_status,
        mock_refresh_by_invoice,
        mock_create_invoice,
        mock_create_fees,
        mock_retryable_obligation_due_email,
        mock_retryable_notice_of_supplementary_report_post_deadline_increases_emissions,
        mock_timezone,
    ) -> None:
        """Test successful full obligation integration process if a supplmentary report has been submitted after the deadline."""
        # Setup mocks
        self._set_vancouver_today(mock_timezone, date(2025, 12, 1))

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        test_data_supp = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            previous_data=test_data,
        )

        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator_id=test_data_supp.compliance_obligation.compliance_report_version.compliance_report.report.operator_id,
        )

        # Setup API responses
        mock_fee_response = FeeResponse(
            clientObjectId=client_operator.client_object_id,
            clientGUID=client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response

        mock_invoice_response = InvoiceResponseStub(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response

        mock_refresh_by_invoice.return_value = None
        mock_update_status.return_value = None

        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Call the method
        ElicensingObligationService.process_obligation_integration(test_data_supp.compliance_obligation.id)

        test_data_supp.compliance_obligation.refresh_from_db()

        # Invoice has been assigned to obligation
        assert test_data_supp.compliance_obligation.elicensing_invoice_id == invoice.id

        mock_update_status.assert_called_once_with(test_data_supp.compliance_obligation.compliance_report_version)
        mock_retryable_obligation_due_email.execute.assert_not_called()
        mock_retryable_notice_of_supplementary_report_post_deadline_increases_emissions.execute.assert_called_once_with(
            test_data_supp.compliance_obligation.pk
        )

    def test_process_obligation_integration_failure_sets_pending_status_and_does_not_email(
        self, mock_sync_client, mock_create_fees, mock_retryable_obligation_due_email
    ) -> None:
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        mock_client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')
        mock_sync_client.return_value = mock_client_operator

        # Mock create_fees to raise an exception
        mock_create_fees.side_effect = Exception("API Error")

        with pytest.raises(Exception, match="API Error"):
            ElicensingObligationService.process_obligation_integration(test_data.compliance_obligation.id)

        test_data.compliance_report_version.refresh_from_db()
        assert (
            test_data.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        mock_retryable_obligation_due_email.execute.assert_not_called()

    def test_handle_obligation_integration_runs_when_invoice_generation_date_passed(
        self, mock_timezone, mock_transaction, mock_retryable_integration
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 11, 15)  # After Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        compliance_period = make_recipe(
            'compliance.tests.utils.compliance_period', invoice_generation_date=date(2025, 11, 1)
        )

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit

        # Act
        ElicensingObligationService.handle_obligation_integration(test_data.compliance_obligation.id, compliance_period)

        # Assert
        mock_transaction.on_commit.assert_called_once()
        mock_retryable_integration.execute.assert_called_once_with(test_data.compliance_obligation.id)

    def test_handle_obligation_integration_after_deadline_has_passed(
        self, mock_timezone, mock_transaction, mock_create_fees, mock_create_invoice
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 12, 15)  # After Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        test_data.compliance_obligation.created_at = datetime(2025, 12, 15, 11, 11, tzinfo=timezone.utc)
        test_data.compliance_obligation.save()
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator_id=test_data.compliance_obligation.compliance_report_version.compliance_report.report.operator_id,
        )

        # Mock transaction.on_commit to execute the callback immediately
        def mock_on_commit(callback):
            callback()

        mock_transaction.on_commit.side_effect = mock_on_commit
        mock_fee_response = FeeResponse(
            clientObjectId=client_operator.client_object_id,
            clientGUID=client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response

        # Act
        ElicensingObligationService.handle_obligation_integration(
            test_data.compliance_obligation.id, test_data.compliance_period
        )

        # Assert
        correct_due_date = test_data.compliance_obligation.created_at + timedelta(days=30)
        invoice_data = {
            "paymentDueDate": str(correct_due_date.strftime("%Y-%m-%d")),
            "businessAreaCode": "OBPS",
            "fees": ['1'],
        }
        mock_create_invoice.assert_called_once_with(
            client_operator.client_object_id, InvoiceCreationRequest(**invoice_data)
        )

    def test_handle_obligation_integration_sets_pending_status_when_invoice_generation_date_not_passed(
        self, mock_timezone
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 10, 15)  # Before Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )

        # Act
        ElicensingObligationService.handle_obligation_integration(
            test_data.compliance_obligation.id, test_data.compliance_period
        )

        # Assert
        test_data.compliance_obligation.compliance_report_version.refresh_from_db()
        assert (
            test_data.compliance_obligation.compliance_report_version.status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )

    def test_is_invoice_generation_date_reached(self, mock_timezone):
        gen_date = date(2025, 11, 1)

        # Before (False)
        self._set_vancouver_today(mock_timezone, date(2025, 10, 31))
        cp = make_recipe("compliance.tests.utils.compliance_period", invoice_generation_date=gen_date)
        assert ElicensingObligationService._is_invoice_generation_date_reached(cp) is False

        # On the date (True)
        self._set_vancouver_today(mock_timezone, date(2025, 11, 1))
        cp = make_recipe("compliance.tests.utils.compliance_period", invoice_generation_date=gen_date)
        assert ElicensingObligationService._is_invoice_generation_date_reached(cp) is True

        # After (True)
        self._set_vancouver_today(mock_timezone, date(2025, 11, 2))
        cp = make_recipe("compliance.tests.utils.compliance_period", invoice_generation_date=gen_date)
        assert ElicensingObligationService._is_invoice_generation_date_reached(cp) is True

    def test_is_invoice_generation_date_today(self, mock_timezone):
        gen_date = date(2025, 11, 1)

        cases = [
            (date(2025, 10, 31), False),  # before
            (date(2025, 11, 1), True),  # exact
            (date(2025, 11, 2), False),  # after
        ]

        for today, expected in cases:
            self._set_vancouver_today(mock_timezone, today)
            cp = make_recipe(
                "compliance.tests.utils.compliance_period",
                invoice_generation_date=gen_date,
            )
            result = ElicensingObligationService._is_invoice_generation_date_today(cp)
            assert result is expected

    def test_get_obligations_for_invoice_generation(self):
        cp_target = make_recipe("compliance.tests.utils.compliance_period")
        cp_other = make_recipe("compliance.tests.utils.compliance_period")

        # Obligation in target period, no invoice, not superseded -> should be included
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        test_data.compliance_report.compliance_period = cp_target
        test_data.compliance_report.save()

        # Obligation in target period, but already has an invoice -> should be excluded
        test_data2 = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data2.compliance_report.compliance_period = cp_target
        test_data2.compliance_report.save()

        # Obligation in target period, no invoice, but superseded -> should be excluded
        test_data3 = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        test_data3.compliance_report.compliance_period = cp_target
        test_data3.compliance_report.save()
        test_data3.compliance_report_version.status = ComplianceReportVersion.ComplianceStatus.SUPERCEDED
        test_data3.compliance_report_version.save()

        # Obligation in a different compliance period -> should be excluded
        test_data4 = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        test_data4.compliance_report.compliance_period = cp_other
        test_data4.compliance_report.save()

        # Act
        qs = ElicensingObligationService._get_obligations_for_invoice_generation(cp_target)

        # Assert
        assert set(qs) == {test_data.compliance_obligation}

    def test_generate_invoices_for_current_period__happy_path(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations_for_invoice,
        mock_handle_integration,
    ):
        """
        Happy path test:
        - Compliance period exists
        - Today is invoice generation date
        - Obligations exist that need invoice generation
        - handle_obligation_integration called for each obligation
        """
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        # if not created and cp.invoice_generation_date != date(2024, 11, 1):
        #     cp.invoice_generation_date = date(2024, 11, 1)
        #     cp.save(update_fields=["invoice_generation_date"])

        obligations = _FauxQueryset([MagicMock(id=101), MagicMock(id=202)])

        mock_get_year.return_value = test_data.reporting_year
        mock_is_today.return_value = True
        mock_get_obligations_for_invoice.return_value = obligations

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(test_data.compliance_period)
        mock_get_obligations_for_invoice.assert_called_once_with(test_data.compliance_period)

        assert mock_handle_integration.call_count == 2
        mock_handle_integration.assert_any_call(101, test_data.compliance_period)
        mock_handle_integration.assert_any_call(202, test_data.compliance_period)

    def test_generate_invoices_for_current_period__no_compliance_period_found(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations_for_invoice,
        mock_handle_integration,
    ):
        """
        Test case: No compliance period exists for the current reporting year
        - Should return early
        - Should not call subsequent methods
        """
        # Arrange
        ry = ReportingYear.objects.get(reporting_year=2024)
        mock_get_year.return_value = ry

        # Ensure no compliance period exists for this reporting year
        CompliancePeriod.objects.filter(reporting_year=ry).delete()

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_not_called()
        mock_get_obligations_for_invoice.assert_not_called()
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__not_invoice_generation_date(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations_for_invoice,
        mock_handle_integration,
    ):
        """
        Test case: Today is not the invoice generation date
        - Should return early without processing obligations
        - Should not call handle_obligation_integration
        """
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        mock_get_year.return_value = test_data.reporting_year
        mock_is_today.return_value = False  # Not invoice generation date

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(test_data.compliance_period)
        mock_get_obligations_for_invoice.assert_not_called()
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__no_obligations_found(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations_for_invoice,
        mock_handle_integration,
    ):
        """
        Test case: No obligations found that need invoice generation
        - Should log info message and return early
        - Should not call handle_obligation_integration
        """
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        empty_obligations = _FauxQueryset([])  # Empty queryset

        mock_get_year.return_value = test_data.reporting_year
        mock_is_today.return_value = True
        mock_get_obligations_for_invoice.return_value = empty_obligations

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(test_data.compliance_period)
        mock_get_obligations_for_invoice.assert_called_once_with(test_data.compliance_period)
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__single_obligation(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations_for_invoice,
        mock_handle_integration,
    ):
        """
        Test case: Single obligation needs invoice generation
        - Should process exactly one obligation
        - Should call handle_obligation_integration once
        """
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )

        mock_get_year.return_value = test_data.reporting_year
        mock_is_today.return_value = True
        mock_get_obligations_for_invoice.return_value = ComplianceObligation.objects.filter(
            id=test_data.compliance_obligation.id
        )

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(test_data.compliance_period)
        mock_get_obligations_for_invoice.assert_called_once_with(test_data.compliance_period)

        assert mock_handle_integration.call_count == 1
        mock_handle_integration.assert_called_once_with(test_data.compliance_obligation.id, test_data.compliance_period)

    def test_send_reminders_for_current_period__happy_path(
        self,
        mock_retryable_send_reminder_of_obligation_email,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        obligations = _FauxQueryset([MagicMock(id=101), MagicMock(id=202)])
        mock_get_current_reporting_year.return_value = test_data.reporting_year
        mock_get_obligations_for_reminders.return_value = obligations

        # Act
        ElicensingObligationService.send_reminders_for_current_period()

        # Assert
        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data.compliance_period)

        assert mock_retryable_send_reminder_of_obligation_email.call_count == 2
        mock_retryable_send_reminder_of_obligation_email.assert_any_call(101)
        mock_retryable_send_reminder_of_obligation_email.assert_any_call(202)

    def test_send_reminders_for_current_period__no_compliance_period_found(
        self,
        mock_retryable_send_reminder_of_obligation_email,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """
        Test case: No compliance period exists for the current reporting year
        - Should return early
        - Should not call subsequent methods
        """
        # Arrange
        ry = ReportingYear.objects.get(reporting_year=2024)
        mock_get_year.return_value = ry

        # Ensure no compliance period exists for this reporting year
        CompliancePeriod.objects.filter(reporting_year=ry).delete()

        obligations = _FauxQueryset([MagicMock(id=101), MagicMock(id=202)])
        mock_get_current_reporting_year.return_value = ry
        mock_get_obligations_for_reminders.return_value = obligations

        # Act
        ElicensingObligationService.send_reminders_for_current_period()

        # Assert
        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_not_called()
        mock_retryable_send_reminder_of_obligation_email.assert_not_called()

    def test_send_reminders_for_current_period__no_obligations_found(
        self,
        mock_retryable_send_reminder_of_obligation_email,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """
        Test case: No obligations found that need reminders
        - Should return early
        - Should not send emails
        """
        # Arrange
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        empty_obligations = _FauxQueryset([])  # Empty queryset

        mock_get_current_reporting_year.return_value = test_data.reporting_year
        mock_get_obligations_for_reminders.return_value = empty_obligations

        # Act

        ElicensingObligationService.send_reminders_for_current_period()

        # Assert
        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data.compliance_period)

        # Assert
        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data.compliance_period)
        mock_retryable_send_reminder_of_obligation_email.assert_not_called()

    def test_get_obligations_for_reminders(self):
        # 2024 obligations with outstanding balances - should all be returned
        for i in range(1, 5):
            test_datai = ComplianceTestHelper.build_test_data(
                reporting_year=2024,
                crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
                create_invoice_data=True,
            )
            test_datai.invoice.outstanding_balance = Decimal(100 * i)
            test_datai.invoice.save()

        # obligation with 0 outstanding balance - should not be returned
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data.invoice.outstanding_balance = Decimal(0)
        test_data.invoice.save()

        # obligation with no invoice - should not be returned
        ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        # obligation in a different compliance period - should not be returned
        ComplianceTestHelper.build_test_data(
            reporting_year=2025,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )

        obligations = ElicensingObligationService._get_obligations_for_reminders(test_data.compliance_period)
        assert obligations.count() == 4

    def test_send_notice_for_penalty_accrual_for_current_period__sends_when_deadline_on_or_before(
        self,
        mock_retryable_penalty_accrual_execute,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """
        CP exists; base queryset returns three obligations:
          - 2024-11-30 (<= deadline) -> send
          - 2025-11-30 (== deadline) -> send
          - 2026-11-30 (>  deadline) -> filtered out
        """
        # current compliance period
        test_data_curr = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        # previous compliance period
        test_data_prev = ComplianceTestHelper.build_test_data(
            reporting_year=2023, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        # next compliance period
        test_data_next = ComplianceTestHelper.build_test_data(
            reporting_year=2025, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        will_send_1 = _make_obligation_for_period(test_data_prev.compliance_period)
        will_send_2 = _make_obligation_for_period(test_data_curr.compliance_period)
        filtered_out = _make_obligation_for_period(test_data_next.compliance_period)

        # Return a real QuerySet so the service's .filter(...) runs in DB
        base_qs = ComplianceObligation.objects.filter(pk__in=[will_send_1.pk, will_send_2.pk, filtered_out.pk])
        mock_get_current_reporting_year.return_value = test_data_curr.reporting_year
        mock_get_obligations_for_reminders.return_value = base_qs

        # Act
        ElicensingObligationService.send_notice_for_penalty_accrual_for_current_period()

        # Assert
        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data_curr.compliance_period)

        called_ids = {c.args[0] for c in mock_retryable_penalty_accrual_execute.call_args_list}
        assert called_ids == {will_send_1.id, will_send_2.id}

    def test_send_notice_for_penalty_accrual_for_current_period__no_compliance_period_found(
        self,
        mock_retryable_penalty_accrual_execute,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """No CP for current RY -> return early, no queries / no emails."""
        ry = ReportingYear.objects.get(reporting_year=2024)
        mock_get_current_reporting_year.return_value = ry

        CompliancePeriod.objects.filter(reporting_year=ry).delete()

        ElicensingObligationService.send_notice_for_penalty_accrual_for_current_period()

        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_not_called()
        mock_retryable_penalty_accrual_execute.assert_not_called()

    def test_send_notice_for_penalty_accrual_for_current_period__none_match_after_filter(
        self,
        mock_retryable_penalty_accrual_execute,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """
        CP exists; base queryset returned by _get_obligations_for_reminders.
        All obligations belong to compliance periods with compliance_deadline AFTER the current period's deadline -> no emails.
        """
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        test_data1 = ComplianceTestHelper.build_test_data(
            reporting_year=2025, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        test_data2 = ComplianceTestHelper.build_test_data(
            reporting_year=2026, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        o1 = _make_obligation_for_period(test_data1.compliance_period)
        o2 = _make_obligation_for_period(test_data2.compliance_period)

        base_qs = ComplianceObligation.objects.filter(pk__in=[o1.pk, o2.pk])
        mock_get_current_reporting_year.return_value = test_data.reporting_year
        mock_get_obligations_for_reminders.return_value = base_qs

        ElicensingObligationService.send_notice_for_penalty_accrual_for_current_period()

        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data.compliance_period)
        mock_retryable_penalty_accrual_execute.assert_not_called()

    def test_send_notice_for_penalty_accrual_for_current_period__empty_base_queryset(
        self,
        mock_retryable_penalty_accrual_execute,
        mock_get_obligations_for_reminders,
        mock_get_current_reporting_year,
    ):
        """Base queryset is empty → .exists() short-circuits; no emails sent."""
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )

        mock_get_current_reporting_year.return_value = test_data.reporting_year
        mock_get_obligations_for_reminders.return_value = ComplianceObligation.objects.none()

        ElicensingObligationService.send_notice_for_penalty_accrual_for_current_period()

        mock_get_current_reporting_year.assert_called_once()
        mock_get_obligations_for_reminders.assert_called_once_with(test_data.compliance_period)
        mock_retryable_penalty_accrual_execute.assert_not_called()

    def test_process_obligation_integration_calls_create_invoice_if_obligation_invoice_number_does_not_exist(
        self,
        mock_timezone,
        mock_sync_client,
        mock_create_fees,
        mock_create_invoice,
        mock_refresh_by_invoice,
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 11, 15)  # After Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        mock_client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')

        mock_sync_client.return_value = mock_client_operator
        mock_fee_response = FeeResponse(
            clientObjectId=mock_client_operator.client_object_id,
            clientGUID=mock_client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response
        mock_invoice_response = InvoiceResponseStub(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response
        make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Act
        ElicensingObligationService.process_obligation_integration(test_data.compliance_obligation.id)
        test_data.compliance_obligation.refresh_from_db()

        # Assert
        mock_create_fees.assert_called_once()
        mock_create_invoice.assert_called_once()
        assert test_data.compliance_obligation.invoice_number == mock_invoice_response.invoiceNumber
        mock_refresh_by_invoice.assert_called_once()

    def test_process_obligation_integration_does_not_call_create_invoice_if_obligation_invoice_number_exists(
        self,
        mock_timezone,
        mock_sync_client,
        mock_create_fees,
        mock_create_invoice,
        mock_refresh_by_invoice,
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 11, 15)  # After Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

        # obligation = make_recipe('compliance.tests.utils.compliance_obligation', invoice_number='inv-001')
        test_data = ComplianceTestHelper.build_test_data(
            reporting_year=2024,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data.compliance_obligation.invoice_number = 'inv-001'
        test_data.compliance_obligation.save()
        mock_client_operator = make_recipe('compliance.tests.utils.elicensing_client_operator')

        mock_sync_client.return_value = mock_client_operator
        mock_fee_response = FeeResponse(
            clientObjectId=mock_client_operator.client_object_id,
            clientGUID=mock_client_operator.client_guid,
            fees=[FeeItem(feeGUID=str(uuid.uuid4()), feeObjectId="1")],
        )

        mock_create_fees.return_value = mock_fee_response
        mock_invoice_response = InvoiceResponseStub(invoiceNumber='inv-001')
        mock_create_invoice.return_value = mock_invoice_response
        make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Act
        ElicensingObligationService.process_obligation_integration(test_data.compliance_obligation.id)
        test_data.compliance_obligation.refresh_from_db()

        # Assert
        mock_create_fees.assert_not_called()
        mock_create_invoice.assert_not_called()
        assert test_data.compliance_obligation.invoice_number == mock_invoice_response.invoiceNumber
        mock_refresh_by_invoice.assert_called_once()
