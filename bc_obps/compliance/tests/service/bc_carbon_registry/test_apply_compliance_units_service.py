import pytest
from unittest.mock import patch, Mock
from model_bakery import baker
from common.exceptions import UserError
from compliance.service.bc_carbon_registry.apply_compliance_units_service import ApplyComplianceUnitsService
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData, ObligationData
from registration.models.operation import Operation
from decimal import Decimal

pytestmark = pytest.mark.django_db

# Base import path for services used in apply_compliance_units_service
APPLY_UNITS_BASE_PATH = "compliance.service.bc_carbon_registry.apply_compliance_units_service"

# Service paths
APPLY_UNITS_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ApplyComplianceUnitsService"
BCCR_ACCOUNT_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.bccr_account_service"
COMPLIANCE_REPORT_VERSION_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ComplianceReportVersionService"
COMPLIANCE_CHARGE_RATE_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ComplianceChargeRateService"
COMPLIANCE_OBLIGATION_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ComplianceObligationService"
COMPLIANCE_ADJUSTMENT_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ComplianceAdjustmentService"
ELICENSING_DATA_REFRESH_SERVICE_PATH = f"{APPLY_UNITS_BASE_PATH}.ElicensingDataRefreshService"

# Specific method paths
COMPUTE_COMPLIANCE_UNIT_CAPS_PATH = f"{APPLY_UNITS_SERVICE_PATH}._compute_compliance_unit_caps"
VALIDATE_QUANTITY_LIMITS = f"{APPLY_UNITS_SERVICE_PATH}._validate_quantity_limits"
CAN_APPLY_COMPLIANCE_UNITS_PATH = f"{APPLY_UNITS_SERVICE_PATH}._can_apply_compliance_units"
COMPLIANCE_CREATE_ADJUSTMENT_PATH = f"{COMPLIANCE_ADJUSTMENT_SERVICE_PATH}.create_adjustment_for_current_version"
GET_OBLIGATION_FOR_REPORT_VERSION_PATH = f"{COMPLIANCE_OBLIGATION_SERVICE_PATH}.get_obligation_for_report_version"
GET_OBLIGATION_DATA_BY_REPORT_VERSION_PATH = (
    f"{COMPLIANCE_OBLIGATION_SERVICE_PATH}.get_obligation_data_by_report_version"
)
ELICENSING_DATA_REFRESH_WRAPPER_PATH = (
    f"{ELICENSING_DATA_REFRESH_SERVICE_PATH}.refresh_data_wrapper_by_compliance_report_version_id"
)

# Model path for adjustments
ELICENSING_ADJUSTMENT_MODEL_PATH = "compliance.models.elicensing_adjustment.ElicensingAdjustment.objects"


@pytest.fixture
def mock_bccr_service():
    with patch(BCCR_ACCOUNT_SERVICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_compliance_report_version_service():
    with patch(COMPLIANCE_REPORT_VERSION_SERVICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_compliance_charge_rate_service():
    with patch(COMPLIANCE_CHARGE_RATE_SERVICE_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_obligation():
    with patch(GET_OBLIGATION_FOR_REPORT_VERSION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_obligation_data():
    with patch(GET_OBLIGATION_DATA_BY_REPORT_VERSION_PATH) as mock:
        yield mock


@pytest.fixture
def mock_create_adjustment():
    with patch(COMPLIANCE_CREATE_ADJUSTMENT_PATH) as mock:
        yield mock


@pytest.fixture
def mock_adjustments_manager():
    with patch(ELICENSING_ADJUSTMENT_MODEL_PATH) as mock:
        yield mock


@pytest.fixture
def mock_can_apply_units():
    with patch(CAN_APPLY_COMPLIANCE_UNITS_PATH) as mock:
        mock.return_value = True
        yield mock


@pytest.fixture
def mock_validate_limits():
    with patch(VALIDATE_QUANTITY_LIMITS) as mock:
        yield mock


@pytest.fixture
def mock_compute_compliance_unit_caps():
    with patch(COMPUTE_COMPLIANCE_UNIT_CAPS_PATH) as mock:
        mock.return_value = (Decimal("500.00"), Decimal("400.00"))
        yield mock


@pytest.fixture
def mock_refresh_data():
    with patch(ELICENSING_DATA_REFRESH_WRAPPER_PATH) as mock:
        yield mock


class TestApplyComplianceUnitsService:
    def test_format_bccr_units_display(self):
        # Arrange
        bccr_units = [
            {
                "id": "1",
                "unitType": "BCE",
                "serialNo": "BCE-2023-0001",
                "vintage": 2023,
                "holdingQuantity": 100,
            },
            {
                "id": "2",
                "unitType": "BCO",
                "serialNo": "BCO-2023-0001",
                "vintage": 2023,
                "holdingQuantity": 50,
            },
            None,  # Test handling of None values
        ]

        # Act
        result = ApplyComplianceUnitsService._format_bccr_units_for_grid_display(bccr_units)

        # Assert
        assert len(result) == 2
        assert isinstance(result[0], BCCRUnit)
        assert result[0].id == "1"
        assert result[0].type == "Earned Credits"
        assert result[0].serial_number == "BCE-2023-0001"
        assert result[0].vintage_year == 2023
        assert result[0].quantity_available == 100

        assert isinstance(result[1], BCCRUnit)
        assert result[1].id == "2"
        assert result[1].type == "Offset Units"
        assert result[1].serial_number == "BCO-2023-0001"
        assert result[1].vintage_year == 2023
        assert result[1].quantity_available == 50

    def test_get_apply_compliance_units_page_data_success(
        self,
        mock_compute_compliance_unit_caps,
        mock_bccr_service,
        mock_compliance_report_version_service,
        mock_compliance_charge_rate_service,
        mock_get_obligation_data,
    ):
        # Arrange
        mock_bccr_service.get_account_details.return_value = Mock(
            entity_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            trading_name="Test Corp",
        )

        mock_bccr_service.get_or_create_compliance_account.return_value = Mock(
            entity_id="789",
            master_account_name="Test Corp Compliance",
        )

        mock_bccr_service.client.list_all_units.return_value = {
            "entities": [
                {
                    "id": "1",
                    "unitType": "BCE",
                    "serialNo": "BCE-2023-0001",
                    "vintage": 2023,
                    "holdingQuantity": 100,
                }
            ]
        }

        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
        )
        mock_compliance_report_version_service.get_compliance_report_version.return_value = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version", compliance_report__report__operation=operation
        )
        mock_compliance_charge_rate_service.get_rate_for_year.return_value = Decimal("75.00")

        mock_obligation_data = ObligationData(
            reporting_year=2023,
            outstanding_balance=Decimal("400.00"),
            equivalent_value=Decimal("30000.00"),
            fee_amount_dollars=Decimal("3000.00"),
            obligation_id="23-0001-1-1",
            penalty_status="NONE",
            data_is_fresh=True,
        )
        mock_get_obligation_data.return_value = mock_obligation_data

        # Stub compute caps: limit 500, remaining 400
        mock_compute_compliance_unit_caps.return_value = (Decimal("500.00"), Decimal("400.00"))

        # Act
        result = ApplyComplianceUnitsService.get_apply_compliance_units_page_data(
            account_id="123",
            compliance_report_version_id=1,
        )

        # Assert
        assert isinstance(result, ComplianceUnitsPageData)
        assert result.bccr_trading_name == "Test Corp Compliance"
        assert result.bccr_compliance_account_id == "789"
        assert result.charge_rate == Decimal("75.00")
        assert result.outstanding_balance == Decimal("30000.00")
        assert len(result.bccr_units) == 1
        assert result.bccr_units[0].serial_number == "BCE-2023-0001"

        assert result.compliance_unit_cap_limit == Decimal("500.00")
        assert result.compliance_unit_cap_remaining == Decimal("400.00")

        mock_get_obligation_data.assert_called_once_with(1)

    def test_get_apply_compliance_units_page_data_no_holding_account(
        self,
        mock_bccr_service,
        mock_compliance_report_version_service,
        mock_compliance_charge_rate_service,
    ):
        # Arrange
        mock_bccr_service.get_account_details.return_value = None

        # Act
        result = ApplyComplianceUnitsService.get_apply_compliance_units_page_data(
            account_id="123",
            compliance_report_version_id=1,
        )

        # Assert
        assert isinstance(result, ComplianceUnitsPageData)
        assert result.bccr_trading_name is None
        assert result.bccr_compliance_account_id is None
        assert result.charge_rate is None
        assert result.outstanding_balance is None
        assert result.bccr_units == []

        # Verify that subsequent service calls were not made
        mock_compliance_report_version_service.get_compliance_report_version.assert_not_called()
        mock_bccr_service.get_or_create_compliance_account.assert_not_called()
        mock_bccr_service.client.list_all_units.assert_not_called()
        mock_compliance_charge_rate_service.get_rate_for_year.assert_not_called()

    def test_calculate_apply_units_cap_success(self, mock_get_obligation):
        mock_obligation = Mock()
        mock_obligation.fee_amount_dollars = Decimal("1000.00")
        mock_get_obligation.return_value = mock_obligation

        result = ApplyComplianceUnitsService._calculate_apply_units_cap(42)
        assert result == Decimal("500.00")

    def test_calculate_apply_units_cap_missing_obligation(self, mock_get_obligation):
        mock_obligation = None
        mock_get_obligation.return_value = mock_obligation

        with pytest.raises(UserError, match="Unable to calculate unit cap: missing obligation or fee amount."):
            ApplyComplianceUnitsService._calculate_apply_units_cap(1)

    def test_calculate_apply_units_cap_missing_fee(self, mock_get_obligation):
        mock_obligation = Mock(fee_amount_dollars=None)
        mock_get_obligation.return_value = mock_obligation

        with pytest.raises(UserError, match="Unable to calculate unit cap: missing obligation or fee amount."):
            ApplyComplianceUnitsService._calculate_apply_units_cap(1)

    def test_can_apply_compliance_units_success(
        self,
        mock_compute_compliance_unit_caps,
        mock_get_obligation_data,
    ):
        # Arrange: simulate cap limit >0 and remaining >0
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("500.00"))

        mock_obligation = Mock()
        mock_obligation.equivalent_value = Decimal("200.00")
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_obligation.elicensing_invoice = Mock(outstanding_balance=Decimal("600.00"))
        mock_get_obligation_data.return_value = mock_obligation

        assert ApplyComplianceUnitsService._can_apply_compliance_units(1) is True

    def test_can_apply_compliance_units_cap_exhausted(
        self,
        mock_compute_compliance_unit_caps,
        mock_get_obligation_data,
    ):
        # Simulate remaining cap zero
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("0.00"))

        mock_obligation = Mock()
        mock_obligation.equivalent_value = Decimal("200.00")
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_obligation.elicensing_invoice = Mock(outstanding_balance=Decimal("600.00"))
        mock_get_obligation_data.return_value = mock_obligation

        assert ApplyComplianceUnitsService._can_apply_compliance_units(1) is False

    def test_can_apply_compliance_units_missing_obligation(
        self, mock_compute_compliance_unit_caps, mock_get_obligation_data
    ):
        # Arrange: no obligation data
        mock_compute_compliance_unit_caps.return_value = (Decimal("0.00"), Decimal("0.00"))
        mock_get_obligation_data.return_value = None

        assert ApplyComplianceUnitsService._can_apply_compliance_units(1) is False

    def test_can_apply_compliance_units_zero_outstanding(
        self,
        mock_compute_compliance_unit_caps,
        mock_get_obligation_data,
    ):
        # Simulate cap available but outstanding/equivalent value zero
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("500.00"))

        mock_obligation = Mock()
        mock_obligation.equivalent_value = Decimal("0.00")
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_obligation.elicensing_invoice = Mock(outstanding_balance=Decimal("0.00"))
        mock_get_obligation_data.return_value = mock_obligation

        assert ApplyComplianceUnitsService._can_apply_compliance_units(1) is False

    def test_validate_quantity_limits_success(self, mock_compute_compliance_unit_caps, mock_get_obligation_data):
        # Arrange
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("500.00"))
        mock_obligation = Mock()
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_get_obligation_data.return_value = mock_obligation

        payload = {
            "total_equivalent_value": "400.00",  # Below remaining cap
            "bccr_units": [
                {
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 50,
                },
                {
                    "serial_number": "BCO-2023-0001",
                    "quantity_available": 200,
                    "quantity_to_be_applied": 200,
                },
                {
                    "serial_number": "BCE-2023-0002",
                    "quantity_available": 75,
                    "quantity_to_be_applied": 0,
                },
            ],
        }

        # Act & Assert — should not raise
        ApplyComplianceUnitsService._validate_quantity_limits(payload, compliance_report_version_id=1)

    def test_validate_quantity_limits_exceeds_available(
        self, mock_compute_compliance_unit_caps, mock_get_obligation_data
    ):
        # Arrange
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("500.00"))
        mock_obligation = Mock()
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_get_obligation_data.return_value = mock_obligation

        payload = {
            "total_equivalent_value": "100.00",  # below remaining cap
            "bccr_units": [
                {
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 150,  # Exceeds available
                }
            ],
        }

        with pytest.raises(
            UserError, match=r"Quantity to be applied .* exceeds available quantity .* for unit BCE-2023-0001"
        ):
            ApplyComplianceUnitsService._validate_quantity_limits(payload, compliance_report_version_id=1)

    def test_validate_quantity_limits_exceeds_remaining_cap(
        self, mock_compute_compliance_unit_caps, mock_get_obligation_data
    ):
        # Arrange: remaining cap is 500, payload asks for 600
        mock_compute_compliance_unit_caps.return_value = (Decimal("1000.00"), Decimal("500.00"))
        mock_obligation = Mock()
        mock_obligation.fee_amount_dollars = Decimal("2000.00")
        mock_get_obligation_data.return_value = mock_obligation

        payload = {
            "total_equivalent_value": "600.00",  # exceeds remaining cap
            "bccr_units": [
                {
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 50,
                }
            ],
        }

        with pytest.raises(UserError, match="exceeds remaining cap"):
            ApplyComplianceUnitsService._validate_quantity_limits(payload, compliance_report_version_id=1)

    def test_get_total_adjustments_no_invoice(self, mock_refresh_data):

        # Simulate refresh result with no invoice
        mock_refresh_result = Mock()
        mock_refresh_result.invoice = None
        mock_refresh_data.return_value = mock_refresh_result

        # Act
        result = ApplyComplianceUnitsService._get_total_adjustments_for_report_version(1)

        # Assert
        assert result == Decimal("0")

    def test_get_total_adjustments_no_line_items_or_aggregate_none(self, mock_refresh_data, mock_adjustments_manager):
        # Arrange: invoice exists but line items are empty and aggregate returns None
        mock_invoice = Mock()
        mock_invoice.elicensing_line_items.all.return_value = []

        mock_refresh_result = Mock()
        mock_refresh_result.invoice = mock_invoice
        mock_refresh_data.return_value = mock_refresh_result

        mock_adjustments_manager.filter.return_value.aggregate.return_value = {"total": None}

        # Act
        result = ApplyComplianceUnitsService._get_total_adjustments_for_report_version(1)

        # Assert: fallback to zero when no line items or aggregate is None
        assert result == Decimal("0")

    def test_apply_compliance_units_success(
        self,
        mock_can_apply_units,
        mock_validate_limits,
        mock_create_adjustment,
        mock_bccr_service,
        mock_get_obligation_data,
        mock_refresh_data,
    ):
        # Arrange
        mock_obligation = Mock(
            fee_amount_dollars=Decimal("1000.00"),
            equivalent_value=Decimal("100.00"),
        )
        mock_get_obligation_data.return_value = mock_obligation

        mock_invoice = Mock()
        mock_invoice.outstanding_balance = Decimal("500.00")
        mock_invoice.elicensing_line_items.all.return_value = []
        mock_refresh_data.return_value.invoice = mock_invoice

        compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        account_id = "123"
        payload = {
            "bccr_compliance_account_id": "456",
            "bccr_units": [
                {
                    "id": "unit-1",
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 50,
                },
                {
                    "id": "unit-2",
                    "serial_number": "BCO-2023-0001",
                    "quantity_available": 200,
                    "quantity_to_be_applied": 75,
                },
            ],
            "total_equivalent_value": "80.00",
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, compliance_report_version.id, payload)

        # Assert
        mock_bccr_service.client.transfer_compliance_units.assert_called_once()
        transfer_payload = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]
        assert transfer_payload["destination_account_id"] == "456"
        assert len(transfer_payload["mixedUnitList"]) == 2

        assert {
            "account_id": "123",
            "serial_no": "BCE-2023-0001",
            "new_quantity": 50,
            "id": "unit-1",
        } in transfer_payload["mixedUnitList"]
        assert {
            "account_id": "123",
            "serial_no": "BCO-2023-0001",
            "new_quantity": 75,
            "id": "unit-2",
        } in transfer_payload["mixedUnitList"]

        mock_can_apply_units.assert_called_once_with(compliance_report_version.id)
        mock_create_adjustment.assert_called_once()
        assert mock_create_adjustment.call_args.kwargs["adjustment_total"] == -Decimal("80.00")

    def test_apply_compliance_units_filters_zero_quantities(
        self,
        mock_can_apply_units,
        mock_validate_limits,
        mock_create_adjustment,
        mock_bccr_service,
        mock_get_obligation_data,
        mock_refresh_data,
    ):
        # Arrange
        mock_obligation = Mock(fee_amount_dollars=Decimal("1000.00"), equivalent_value=Decimal("100.00"))
        mock_get_obligation_data.return_value = mock_obligation

        mock_invoice = Mock(outstanding_balance=Decimal("500.00"))
        mock_invoice.elicensing_line_items.all.return_value = []
        mock_refresh_data.return_value.invoice = mock_invoice

        mock_bccr_service.client.transfer_compliance_units.return_value = {"success": True}

        compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        account_id = "123"
        payload = {
            "bccr_compliance_account_id": "456",
            "bccr_units": [
                {
                    "id": "unit-1",
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 50,
                },
                {
                    "id": "unit-2",
                    "serial_number": "BCO-2023-0001",
                    "quantity_available": 200,
                    "quantity_to_be_applied": 0,
                },
                {
                    "id": "unit-3",
                    "serial_number": "BCE-2023-0002",
                    "quantity_available": 150,
                    "quantity_to_be_applied": -10,
                },
                {
                    "id": "unit-4",
                    "serial_number": "BCO-2023-0002",
                    "quantity_available": 300,
                    "quantity_to_be_applied": 25,
                },
            ],
            "total_equivalent_value": "80.00",
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, compliance_report_version.id, payload)

        # Assert
        transfer_payload = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]
        serials = [u["serial_no"] for u in transfer_payload["mixedUnitList"]]
        assert "BCE-2023-0001" in serials
        assert "BCO-2023-0002" in serials
        assert "BCO-2023-0001" not in serials
        assert "BCE-2023-0002" not in serials
        assert mock_create_adjustment.call_args.kwargs["adjustment_total"] == -Decimal("80.00")

    def test_apply_compliance_units_all_zero_quantities(
        self,
        mock_can_apply_units,
        mock_validate_limits,
        mock_create_adjustment,
        mock_bccr_service,
        mock_get_obligation_data,
        mock_refresh_data,
    ):
        # Arrange
        mock_obligation = Mock(fee_amount_dollars=Decimal("1000.00"), equivalent_value=Decimal("100.00"))
        mock_get_obligation_data.return_value = mock_obligation

        mock_invoice = Mock(outstanding_balance=Decimal("500.00"))
        mock_invoice.elicensing_line_items.all.return_value = []
        mock_refresh_data.return_value.invoice = mock_invoice

        mock_bccr_service.client.transfer_compliance_units.return_value = {"success": True}

        compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        account_id = "123"
        payload = {
            "bccr_compliance_account_id": "456",
            "bccr_units": [
                {
                    "id": "unit-1",
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 0,
                },
                {
                    "id": "unit-2",
                    "serial_number": "BCO-2023-0001",
                    "quantity_available": 200,
                    "quantity_to_be_applied": 0,
                },
            ],
            "total_equivalent_value": "0.00",
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, compliance_report_version.id, payload)

        # Assert
        call_args = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]
        assert call_args["mixedUnitList"] == []
        assert mock_create_adjustment.call_args.kwargs["adjustment_total"] == -Decimal("0.00")
