import pytest
from unittest.mock import patch, Mock
from model_bakery import baker
from compliance.service.apply_compliance_units_service import ApplyComplianceUnitsService
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData
from registration.models.operation import Operation

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_bccr_service():
    with patch('compliance.service.apply_compliance_units_service.bccr_service') as mock:
        yield mock


@pytest.fixture
def mock_compliance_report_version_service():
    with patch('compliance.service.apply_compliance_units_service.ComplianceReportVersionService') as mock:
        yield mock


@pytest.fixture
def mock_compliance_charge_rate_service():
    with patch('compliance.service.apply_compliance_units_service.ComplianceChargeRateService') as mock:
        yield mock


class TestApplyComplianceUnitsService:
    def test_format_bccr_units_for_display(self):
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
        result = ApplyComplianceUnitsService._format_bccr_units_for_display(bccr_units)

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
        mock_compliance_charge_rate_service.get_rate_for_year.return_value = "75.00"

        # Act
        result = ApplyComplianceUnitsService.get_apply_compliance_units_page_data(
            account_id="123",
            compliance_report_version_id=1,
        )

        # Assert
        assert isinstance(result, ComplianceUnitsPageData)
        assert result.bccr_trading_name == "Test Corp Compliance"
        assert result.bccr_compliance_account_id == "789"
        assert result.charge_rate == "75.00"
        assert result.outstanding_balance == "16000"
        assert len(result.bccr_units) == 1
        assert result.bccr_units[0].type == "Earned Credits"
        assert result.bccr_units[0].serial_number == "BCE-2023-0001"

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
