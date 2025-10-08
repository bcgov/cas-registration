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

ELICENSING_OBLIGATION_SERVICE_PATH = "compliance.service.elicensing.elicensing_obligation_service"
TIMEZONE_PATH = f"{ELICENSING_OBLIGATION_SERVICE_PATH}.timezone"
TRANSACTION_PATH = f"{ELICENSING_OBLIGATION_SERVICE_PATH}.transaction"
ELICENSING_OBLIGATION_SERVICE = (
    "compliance.service.elicensing.elicensing_obligation_service.ElicensingObligationService"
)
IS_TODAY_PATH = f"{ELICENSING_OBLIGATION_SERVICE}._is_invoice_generation_date_today"
GET_OBLIGATIONS_PATH = f"{ELICENSING_OBLIGATION_SERVICE}._get_obligations_for_invoice_generation"
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

SYNC_WITH_ELICENSING_PATH = (
    f"{ELICENSING_OBLIGATION_SERVICE_PATH}.ElicensingOperatorService.sync_client_with_elicensing"
)

UPDATE_COMPLIANCE_STATUS_PATH = (
    "compliance.service.compliance_report_version_service.ComplianceReportVersionService.update_compliance_status"
)


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
def mock_get_obligations():
    with patch(GET_OBLIGATIONS_PATH) as mock:
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
def mock_update_status():
    with patch(UPDATE_COMPLIANCE_STATUS_PATH) as mock:
        yield mock


@pytest.fixture
def mock_sync_client():
    with patch(SYNC_WITH_ELICENSING_PATH) as mock:
        yield mock


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


class _FauxQueryset(list):
    def exists(self):
        return bool(self)


class TestElicensingObligationService:
    def _set_vancouver_today(self, mock_timezone, d: date) -> None:
        """Helper to mock Vancouver timezone's 'today' date."""
        mock_dt = MagicMock()
        mock_dt.astimezone.return_value.date.return_value = d
        mock_timezone.now.return_value = mock_dt

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

    def test_process_obligation_integration_success(
        self,
        mock_update_status,
        mock_refresh_by_invoice,
        mock_create_invoice,
        mock_create_fees,
        mock_retryable_obligation_due_email,
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

        mock_refresh_by_invoice.return_value = None
        mock_update_status.return_value = None

        invoice = make_recipe('compliance.tests.utils.elicensing_invoice', invoice_number='inv-001')

        # Call the method
        ElicensingObligationService.process_obligation_integration(obligation.id)

        obligation.refresh_from_db()

        # Invoice has been assigned to obligation
        assert obligation.elicensing_invoice_id == invoice.id

        mock_update_status.assert_called_once_with(obligation.compliance_report_version)
        mock_retryable_obligation_due_email.execute.assert_called_once_with(obligation.pk)

    def test_process_obligation_integration_failure_sets_pending_status_and_does_not_email(
        self, mock_sync_client, mock_create_fees, mock_retryable_obligation_due_email
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
        mock_retryable_obligation_due_email.execute.assert_not_called()

    def test_handle_obligation_integration_runs_when_invoice_generation_date_passed(
        self, mock_timezone, mock_transaction, mock_retryable_integration
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 11, 15)  # After Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

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

    def test_handle_obligation_integration_sets_pending_status_when_invoice_generation_date_not_passed(
        self, mock_timezone
    ):
        # Arrange
        mock_datetime = MagicMock()
        mock_datetime.astimezone.return_value.date.return_value = date(2025, 10, 15)  # Before Nov 1, 2025
        mock_timezone.now.return_value = mock_datetime

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
        obligation_ok = make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version__compliance_report__compliance_period=cp_target,
            elicensing_invoice=None,
            compliance_report_version__status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        # Obligation in target period, but already has an invoice -> should be excluded
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version__compliance_report__compliance_period=cp_target,
            elicensing_invoice=make_recipe("compliance.tests.utils.elicensing_invoice"),
        )

        # Obligation in target period, no invoice, but superseded -> should be excluded
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version__compliance_report__compliance_period=cp_target,
            elicensing_invoice=None,
            compliance_report_version__status=ComplianceReportVersion.ComplianceStatus.SUPERCEDED,
        )

        # Obligation in a different compliance period -> should be excluded
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version__compliance_report__compliance_period=cp_other,
            elicensing_invoice=None,
            compliance_report_version__status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        # Act
        qs = ElicensingObligationService._get_obligations_for_invoice_generation(cp_target)

        # Assert
        assert set(qs) == {obligation_ok}

    def test_generate_invoices_for_current_period__happy_path(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations,
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
        ry = ReportingYear.objects.get(reporting_year=2024)

        cp, created = CompliancePeriod.objects.get_or_create(
            reporting_year=ry,
            defaults={"invoice_generation_date": date(2024, 11, 1)},
        )
        if not created and cp.invoice_generation_date != date(2024, 11, 1):
            cp.invoice_generation_date = date(2024, 11, 1)
            cp.save(update_fields=["invoice_generation_date"])

        obligations = _FauxQueryset([MagicMock(id=101), MagicMock(id=202)])

        mock_get_year.return_value = ry
        mock_is_today.return_value = True
        mock_get_obligations.return_value = obligations

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(cp)
        mock_get_obligations.assert_called_once_with(cp)

        assert mock_handle_integration.call_count == 2
        mock_handle_integration.assert_any_call(101, cp)
        mock_handle_integration.assert_any_call(202, cp)

    def test_generate_invoices_for_current_period__no_compliance_period_found(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations,
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
        mock_get_obligations.assert_not_called()
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__not_invoice_generation_date(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations,
        mock_handle_integration,
    ):
        """
        Test case: Today is not the invoice generation date
        - Should return early without processing obligations
        - Should not call handle_obligation_integration
        """
        # Arrange
        ry = ReportingYear.objects.get(reporting_year=2024)
        cp, created = CompliancePeriod.objects.get_or_create(
            reporting_year=ry,
            defaults={"invoice_generation_date": date(2024, 11, 1)},
        )

        mock_get_year.return_value = ry
        mock_is_today.return_value = False  # Not invoice generation date

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(cp)
        mock_get_obligations.assert_not_called()
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__no_obligations_found(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations,
        mock_handle_integration,
    ):
        """
        Test case: No obligations found that need invoice generation
        - Should log info message and return early
        - Should not call handle_obligation_integration
        """
        # Arrange
        ry = ReportingYear.objects.get(reporting_year=2024)
        cp, created = CompliancePeriod.objects.get_or_create(
            reporting_year=ry,
            defaults={"invoice_generation_date": date(2024, 11, 1)},
        )

        empty_obligations = _FauxQueryset([])  # Empty queryset

        mock_get_year.return_value = ry
        mock_is_today.return_value = True
        mock_get_obligations.return_value = empty_obligations

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(cp)
        mock_get_obligations.assert_called_once_with(cp)
        mock_handle_integration.assert_not_called()

    def test_generate_invoices_for_current_period__single_obligation(
        self,
        mock_get_year,
        mock_is_today,
        mock_get_obligations,
        mock_handle_integration,
    ):
        """
        Test case: Single obligation needs invoice generation
        - Should process exactly one obligation
        - Should call handle_obligation_integration once
        """
        # Arrange
        ry = ReportingYear.objects.get(reporting_year=2024)
        cp, created = CompliancePeriod.objects.get_or_create(
            reporting_year=ry,
            defaults={"invoice_generation_date": date(2024, 11, 1)},
        )

        single_obligation = _FauxQueryset([MagicMock(id=999)])  # Single obligation

        mock_get_year.return_value = ry
        mock_is_today.return_value = True
        mock_get_obligations.return_value = single_obligation

        # Act
        ElicensingObligationService.generate_invoices_for_current_period()

        # Assert
        mock_get_year.assert_called_once()
        mock_is_today.assert_called_once_with(cp)
        mock_get_obligations.assert_called_once_with(cp)

        assert mock_handle_integration.call_count == 1
        mock_handle_integration.assert_called_once_with(999, cp)
