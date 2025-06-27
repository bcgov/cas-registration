import pytest
from model_bakery import baker
from unittest.mock import patch
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.dataclass import BCCRAccountResponseDetails, BCCRComplianceAccountResponseDetails
from registration.models.operation import Operation

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_api_client():
    with patch('compliance.service.bc_carbon_registry.bc_carbon_registry_service.BCCarbonRegistryAPIClient') as mock:
        yield mock.return_value


@pytest.fixture
def service(mock_api_client):
    return BCCarbonRegistryAccountService()


@pytest.fixture
def compliance_report_instance():
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
        status=Operation.Statuses.REGISTERED,
    )
    compliance_report = baker.make_recipe("compliance.tests.utils.compliance_report", report__operation=operation)
    return compliance_report


class TestBCCarbonRegistryAccountService:
    def test_get_first_entity_with_valid_response(self, service):
        # Arrange
        response = {"entities": [{"entityId": "123", "tradingName": "Test Corp"}]}

        # Act
        result = service._get_first_entity(response)

        # Assert
        assert result == {"entityId": "123", "tradingName": "Test Corp"}

    def test_get_first_entity_with_empty_response(self, service):
        # Arrange
        response = {"entities": []}

        # Act
        result = service._get_first_entity(response)

        # Assert
        assert result is None

    def test_get_first_entity_with_none_response(self, service):
        # Arrange & Act
        result = service._get_first_entity(None)

        # Assert
        assert result is None

    def test_get_account_details_success(self, service, mock_api_client):
        # Arrange
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "123",
                    "organizationClassificationId": "456",
                    "type_of_account_holder": "Corporation",
                    "tradingName": "Test Corp",
                }
            ]
        }

        # Act
        result = service.get_account_details("123")

        # Assert
        assert isinstance(result, BCCRAccountResponseDetails)
        assert result.entity_id == "123"
        assert result.organization_classification_id == "456"
        assert result.type_of_account_holder == "Corporation"
        assert result.trading_name == "Test Corp"

    def test_get_account_details_not_found(self, service, mock_api_client):
        # Arrange
        mock_api_client.get_account_details.return_value = {"entities": []}

        # Act
        result = service.get_account_details("123")

        # Assert
        assert result is None

    def test_get_type_of_organization_mapping(self, service):
        # Arrange & Act & Assert
        assert service._get_type_of_organization("Individual") == "140000000000001"
        assert service._get_type_of_organization("Corporation") == "140000000000002"
        assert service._get_type_of_organization("Partnership") == "140000000000003"
        assert service._get_type_of_organization("Invalid") is None
        assert service._get_type_of_organization(None) is None

    def test_create_compliance_account(self, service, mock_api_client, compliance_report_instance):
        # Arrange
        mock_api_client.create_sub_account.return_value = {"entity": {"id": "789", "parent_name": "Parent Corp"}}

        # Act
        result = service.create_compliance_account(
            holding_account_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            compliance_year=2024,
            boro_id="BORO123",
            compliance_report=compliance_report_instance,
        )

        # Assert
        assert isinstance(result, BCCRComplianceAccountResponseDetails)
        assert result.entity_id == "789"
        assert result.master_account_name == "Parent Corp"

        # Verify the API call
        mock_api_client.create_sub_account.assert_called_once()
        call_args = mock_api_client.create_sub_account.call_args[0][0]
        assert call_args["master_account_id"] == "123"
        assert call_args["compliance_year"] == 2024
        assert call_args["boro_id"] == "BORO123"
        assert call_args["type_of_organization"] == "140000000000002"

    def test_get_or_create_compliance_account_existing(self, service, mock_api_client):
        # Arrange
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id="123456789012345"
        )
        holding_account = BCCRAccountResponseDetails(
            entity_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            trading_name="Test Corp",
        )
        # Act
        result = service.get_or_create_compliance_account(
            holding_account_details=holding_account, compliance_report=compliance_report
        )
        # Assert
        assert isinstance(result, BCCRComplianceAccountResponseDetails)
        assert result.entity_id == "123456789012345"
        assert result.master_account_name == "Test Corp"
        mock_api_client.create_sub_account.assert_not_called()

    def test_get_or_create_compliance_account_new(self, service, mock_api_client):
        # Arrange
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
        )
        report = baker.make_recipe("reporting.tests.utils.report", operation=operation)
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", report=report, bccr_subaccount_id=None
        )
        holding_account = BCCRAccountResponseDetails(
            entity_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            trading_name="Test Corp",
        )
        mock_api_client.get_compliance_account.return_value = {"entities": []}
        mock_api_client.create_sub_account.return_value = {"entity": {"id": "789", "parent_name": "Parent Corp"}}
        # Act
        result = service.get_or_create_compliance_account(
            holding_account_details=holding_account, compliance_report=compliance_report
        )
        # Assert
        assert isinstance(result, BCCRComplianceAccountResponseDetails)
        assert result.entity_id == "789"
        assert result.master_account_name == "Parent Corp"
        mock_api_client.create_sub_account.assert_called_once()
