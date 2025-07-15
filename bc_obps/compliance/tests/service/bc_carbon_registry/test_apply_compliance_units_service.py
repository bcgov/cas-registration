import pytest
from unittest.mock import patch, Mock
from model_bakery import baker
from common.exceptions import UserError
from compliance.service.bc_carbon_registry.apply_compliance_units_service import ApplyComplianceUnitsService
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData, ObligationData
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.models.operation import Operation
from decimal import Decimal

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_bccr_service():
    with patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service') as mock:
        yield mock


@pytest.fixture
def mock_compliance_report_version_service():
    with patch(
        'compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceReportVersionService'
    ) as mock:
        yield mock


@pytest.fixture
def mock_compliance_charge_rate_service():
    with patch(
        'compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceChargeRateService'
    ) as mock:
        yield mock


@pytest.fixture
def mock_compliance_obligation_service():
    with patch(
        'compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceObligationService'
    ) as mock:
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
        mock_bccr_service,
        mock_compliance_report_version_service,
        mock_compliance_charge_rate_service,
        mock_compliance_obligation_service,
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

        # Mock the obligation data with outstanding balance
        mock_obligation_data = ObligationData(
            reporting_year=2023,
            outstanding_balance=Decimal("400.00"),  # tCO2e equivalent
            equivalent_value=Decimal("30000.00"),  # dollars
            obligation_id="23-0001-1-1",
            data_is_fresh=True,
        )
        mock_compliance_obligation_service.get_obligation_data_by_report_version.return_value = mock_obligation_data

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
        assert result.bccr_units[0].type == "Earned Credits"
        assert result.bccr_units[0].serial_number == "BCE-2023-0001"

        # Verify the obligation service was called correctly
        mock_compliance_obligation_service.get_obligation_data_by_report_version.assert_called_once_with(1)

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

    def test_validate_quantity_limits_success(self):
        # Arrange
        units = [
            {
                "serial_number": "BCE-2023-0001",
                "quantity_available": 100,
                "quantity_to_be_applied": 50,
            },
            {
                "serial_number": "BCO-2023-0001",
                "quantity_available": 200,
                "quantity_to_be_applied": 200,  # Equal is allowed
            },
            {
                "serial_number": "BCE-2023-0002",
                "quantity_available": 75,
                "quantity_to_be_applied": 0,  # Zero is allowed
            },
        ]

        # Act & Assert - should not raise any exception
        ApplyComplianceUnitsService._validate_quantity_limits(units)

    def test_validate_quantity_limits_exceeds_available(self):
        # Arrange
        units = [
            {
                "serial_number": "BCE-2023-0001",
                "quantity_available": 100,
                "quantity_to_be_applied": 150,  # Exceeds available
            }
        ]

        # Act & Assert
        with pytest.raises(UserError, match="Quantity to be applied exceeds available quantity for unit BCE-2023-0001"):
            ApplyComplianceUnitsService._validate_quantity_limits(units)

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    def test_apply_compliance_units_success(self, mock_bccr_service):
        # Arrange
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
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, payload)

        # Assert
        mock_bccr_service.client.transfer_compliance_units.assert_called_once()
        call_args = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]

        # Verify the transfer payload structure
        assert call_args["destination_account_id"] == "456"
        assert len(call_args["mixedUnitList"]) == 2

        # Verify first unit
        unit1 = call_args["mixedUnitList"][0]
        assert unit1["account_id"] == "123"
        assert unit1["serial_no"] == "BCE-2023-0001"
        assert unit1["new_quantity"] == 50
        assert unit1["id"] == "unit-1"

        # Verify second unit
        unit2 = call_args["mixedUnitList"][1]
        assert unit2["account_id"] == "123"
        assert unit2["serial_no"] == "BCO-2023-0001"
        assert unit2["new_quantity"] == 75
        assert unit2["id"] == "unit-2"

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    def test_apply_compliance_units_filters_zero_quantities(self, mock_bccr_service):
        # Arrange
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
                    "quantity_to_be_applied": 0,  # Should be filtered out
                },
                {
                    "id": "unit-3",
                    "serial_number": "BCE-2023-0002",
                    "quantity_available": 150,
                    "quantity_to_be_applied": -10,  # Should be filtered out
                },
                {
                    "id": "unit-4",
                    "serial_number": "BCO-2023-0002",
                    "quantity_available": 300,
                    "quantity_to_be_applied": 25,
                },
            ],
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, payload)

        # Assert
        mock_bccr_service.client.transfer_compliance_units.assert_called_once()
        call_args = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]

        # Should only include units with positive quantities
        assert len(call_args["mixedUnitList"]) == 2

        # Verify only the units with positive quantities are included
        serial_numbers = [unit["serial_no"] for unit in call_args["mixedUnitList"]]
        assert "BCE-2023-0001" in serial_numbers
        assert "BCO-2023-0002" in serial_numbers
        assert "BCO-2023-0001" not in serial_numbers
        assert "BCE-2023-0002" not in serial_numbers

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    def test_apply_compliance_units_validation_error(self, mock_bccr_service):
        # Arrange
        account_id = "123"
        payload = {
            "bccr_compliance_account_id": "456",
            "bccr_units": [
                {
                    "id": "unit-1",
                    "serial_number": "BCE-2023-0001",
                    "quantity_available": 100,
                    "quantity_to_be_applied": 150,  # Exceeds available
                }
            ],
        }

        # Act & Assert
        with pytest.raises(UserError, match="Quantity to be applied exceeds available quantity for unit BCE-2023-0001"):
            ApplyComplianceUnitsService.apply_compliance_units(account_id, payload)

        # Verify that the transfer was not called due to validation error
        mock_bccr_service.client.transfer_compliance_units.assert_not_called()

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    def test_apply_compliance_units_all_zero_quantities(self, mock_bccr_service):
        # Arrange
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
        }

        # Act
        ApplyComplianceUnitsService.apply_compliance_units(account_id, payload)

        # Assert
        mock_bccr_service.client.transfer_compliance_units.assert_called_once()
        call_args = mock_bccr_service.client.transfer_compliance_units.call_args[0][0]
        assert call_args["destination_account_id"] == "456"
        assert call_args["mixedUnitList"] == []

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceReportVersionService')
    def test_get_applied_compliance_units_data_success(
        self, mock_report_version_service, mock_bccr_service, mock_compliance_charge_rate_service
    ):
        # Arrange
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id="123456789101234"
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version", compliance_report=compliance_report
        )
        mock_report_version_service.get_compliance_report_version.return_value = compliance_report_version

        mock_bccr_service.client.list_all_units.return_value = {
            "entities": [
                {
                    "id": "1",
                    "unitType": "BCE",
                    "serialNo": "BCE-2025-0001",
                    "vintage": 2025,
                    "holdingQuantity": 50,
                }
            ]
        }
        mock_compliance_charge_rate_service.get_rate_for_year.return_value = Decimal("80.00")

        # Act
        result = ApplyComplianceUnitsService.get_applied_compliance_units_data(42)

        # Assert
        mock_report_version_service.get_compliance_report_version.assert_called_once_with(42)
        mock_bccr_service.client.list_all_units.assert_called_once_with(
            account_id="123456789101234", state_filter="ACTIVE,RETIRED"
        )
        mock_compliance_charge_rate_service.get_rate_for_year.assert_called_once_with(
            compliance_report.report.reporting_year
        )
        assert isinstance(result, list)
        assert isinstance(result[0], BCCRUnit)
        assert result[0].id == "1"
        assert result[0].type == "Earned Credits"
        assert result[0].serial_number == "BCE-2025-0001"
        assert result[0].vintage_year == 2025
        assert result[0].quantity_applied == "50"
        assert result[0].equivalent_value == "4000.00"  # 50 * 80

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceReportVersionService')
    def test_get_applied_compliance_units_data_no_subaccount(self, mock_report_version_service, mock_bccr_service):
        # Arrange
        compliance_report = baker.make_recipe("compliance.tests.utils.compliance_report", bccr_subaccount_id=None)
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version", compliance_report=compliance_report
        )
        mock_report_version_service.get_compliance_report_version.return_value = compliance_report_version

        # Act
        result = ApplyComplianceUnitsService.get_applied_compliance_units_data(42)

        # Assert
        assert result == []

    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.bccr_account_service')
    @patch('compliance.service.bc_carbon_registry.apply_compliance_units_service.ComplianceReportVersionService')
    def test_get_applied_compliance_units_data_bccr_error(self, mock_report_version_service, mock_bccr_service):
        # Arrange
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id="123456789101234"
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version", compliance_report=compliance_report
        )
        mock_report_version_service.get_compliance_report_version.return_value = compliance_report_version

        mock_bccr_service.client.list_all_units.side_effect = BCCarbonRegistryError("Service error")

        # Act & Assert
        with pytest.raises(BCCarbonRegistryError):
            ApplyComplianceUnitsService.get_applied_compliance_units_data(42)
