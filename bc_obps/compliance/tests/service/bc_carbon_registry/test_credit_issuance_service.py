from datetime import date
import pytest
from unittest.mock import patch
from model_bakery import baker
from compliance.service.bc_carbon_registry.credit_issuance_service import BCCarbonRegistryCreditIssuanceService
from common.exceptions import UserError

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_api_client():
    with patch('compliance.service.bc_carbon_registry.bc_carbon_registry_api_client.BCCarbonRegistryAPIClient') as mock:
        yield mock.return_value


@pytest.fixture
def service(mock_api_client):
    service_instance = BCCarbonRegistryCreditIssuanceService()
    # Replace the client instance with our mock
    service_instance.client = mock_api_client
    return service_instance


@pytest.fixture
def earned_credit():
    compliance_period = baker.make_recipe(
        "compliance.tests.utils.compliance_period",
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31),
    )
    report = baker.make_recipe("reporting.tests.utils.report")
    compliance_report = baker.make_recipe(
        "compliance.tests.utils.compliance_report",
        report=report,
        compliance_period=compliance_period,
    )
    compliance_report_version = baker.make_recipe(
        "compliance.tests.utils.compliance_report_version",
        compliance_report=compliance_report,
    )
    earned_credit = baker.make_recipe(
        "compliance.tests.utils.compliance_earned_credit",
        compliance_report_version=compliance_report_version,
        earned_credits_amount=100,
        bccr_trading_name="Test Trading Name",
        bccr_holding_account_id="123456789012345",
        issuance_requested_date=date(2024, 6, 15),
    )
    return earned_credit


@pytest.fixture
def bccr_project_data():
    return {
        "id": "project_123",
        "mixedUnitList": [
            {
                "id": "unit_456",
                "city": "Vancouver",
                "address_line_1": "123 Test Street",
                "zipcode": "V6B 1A1",
                "latitude": 49.2827,
                "longitude": -123.1207,
                "project_type_id": "140000000000002",
            }
        ],
    }


class TestBCCarbonRegistryCreditIssuanceService:
    def test_issue_credits_success(self, service, mock_api_client, earned_credit, bccr_project_data):
        # Arrange
        mock_api_client.create_issuance.return_value = {"id": "issuance_789"}

        # Act
        service.issue_credits(earned_credit, bccr_project_data)

        # Assert
        mock_api_client.create_issuance.assert_called_once()
        call_args = mock_api_client.create_issuance.call_args[1]["issuance_data"]

        # Verify issuance data structure
        assert call_args["account_id"] == "123456789012345"
        assert call_args["issuance_requested_date"] == "2024-06-15T00:00:00.000Z"
        assert call_args["project_id"] == "project_123"

        # Verify verification data
        verification = call_args["verifications"][0]
        assert verification["verificationStartDate"] == "01/01/2024"
        assert verification["verificationEndDate"] == "31/12/2024"
        assert verification["monitoringPeriod"] == "01/01/2024 - 31/12/2024"

        # Verify mixed units data
        mixed_unit = verification["mixedUnits"][0]
        assert mixed_unit["holding_quantity"] == 100
        assert mixed_unit["vintage_start"] == "2024-01-01T00:00:00.000Z"
        assert mixed_unit["vintage_end"] == "2024-12-31T00:00:00.000Z"
        assert mixed_unit["city"] == "Vancouver"
        assert mixed_unit["address_line_1"] == "123 Test Street"
        assert mixed_unit["zipcode"] == "V6B 1A1"
        assert mixed_unit["latitude"] == "49.2827"
        assert mixed_unit["longitude"] == "-123.1207"
        assert mixed_unit["defined_unit_id"] == "unit_456"
        assert mixed_unit["project_type_id"] == "140000000000002"

    def test_issue_credits_bccr_api_failure(self, service, mock_api_client, earned_credit, bccr_project_data):
        # Arrange
        mock_api_client.create_issuance.return_value = {}  # No ID in response

        # Act & Assert
        with pytest.raises(UserError, match="Failed to issue credits in BCCR"):
            service.issue_credits(earned_credit, bccr_project_data)

    def test_issue_credits_empty_mixed_unit_list(self, service, mock_api_client, earned_credit):
        # Arrange
        bccr_project_data_empty = {"id": "project_123", "mixedUnitList": []}
        mock_api_client.create_issuance.return_value = {"id": "issuance_789"}

        # Act & Assert
        with pytest.raises(IndexError):
            service.issue_credits(earned_credit, bccr_project_data_empty)

    def test_issue_credits_missing_mixed_unit_list(self, service, mock_api_client, earned_credit):
        # Arrange
        bccr_project_data_missing = {
            "id": "project_123"
            # Missing mixedUnitList
        }
        mock_api_client.create_issuance.return_value = {"id": "issuance_789"}

        # Act & Assert
        with pytest.raises(KeyError):
            service.issue_credits(earned_credit, bccr_project_data_missing)

    def test_issue_credits_missing_project_id(self, service, mock_api_client, earned_credit, bccr_project_data):
        # Arrange
        bccr_project_data_no_id = {
            "mixedUnitList": [
                {
                    "id": "unit_456",
                    "city": "Vancouver",
                    "address_line_1": "123 Test Street",
                    "zipcode": "V6B 1A1",
                    "latitude": 49.2827,
                    "longitude": -123.1207,
                    "project_type_id": "140000000000002",
                }
            ]
        }
        mock_api_client.create_issuance.return_value = {"id": "issuance_789"}

        # Act & Assert
        with pytest.raises(KeyError):
            service.issue_credits(earned_credit, bccr_project_data_no_id)
