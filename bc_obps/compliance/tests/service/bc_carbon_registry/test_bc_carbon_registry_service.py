import pytest
from model_bakery import baker
from unittest.mock import patch
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.dataclass import BCCRAccountResponseDetails, BCCRComplianceAccountResponseDetails
from registration.models.operation import Operation

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_api_client():
    with patch('compliance.service.bc_carbon_registry.account_service.BCCarbonRegistryAPIClient') as mock:
        yield mock


@pytest.fixture
def service():
    service_instance = BCCarbonRegistryAccountService()
    return service_instance


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
        service.client = mock_api_client
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
        mock_api_client.get_account_details.assert_called_once_with(account_id="123")
        assert isinstance(result, BCCRAccountResponseDetails)
        assert result.entity_id == "123"
        assert result.organization_classification_id == "456"
        assert result.type_of_account_holder == "Corporation"
        assert result.trading_name == "Test Corp"

    def test_get_account_details_with_null_type_of_account_holder(self, service, mock_api_client):
        # Arrange - Test the schema change where type_of_account_holder can be null
        service.client = mock_api_client
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "123",
                    "organizationClassificationId": "456",
                    "type_of_account_holder": None,  # This should now be allowed
                    "tradingName": "Test Corp",
                }
            ]
        }

        # Act
        result = service.get_account_details("123")

        # Assert
        mock_api_client.get_account_details.assert_called_once_with(account_id="123")
        assert isinstance(result, BCCRAccountResponseDetails)
        assert result.entity_id == "123"
        assert result.organization_classification_id == "456"
        assert result.type_of_account_holder is None  # Should handle None gracefully
        assert result.trading_name == "Test Corp"

    def test_get_account_details_not_found(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
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
        service.client = mock_api_client
        # Create a report version with report operation
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version", report=compliance_report_instance.report
        )
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_name="Test Operation Name",
        )

        # Create a report compliance summary
        report_compliance_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary", report_version=report_version
        )

        # Create a compliance report version
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report_instance,
            report_compliance_summary=report_compliance_summary,
        )

        mock_api_client.create_sub_account.return_value = {"entity": {"id": "789", "parent_name": "Parent Corp"}}

        # Act
        result = service.create_compliance_account(
            holding_account_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            compliance_year=2024,
            boro_id="BORO123",
            compliance_report_version=compliance_report_version,
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
        assert call_args["registered_name"] == "Test Operation Name BORO123"
        assert call_args["type_of_organization"] == "140000000000002"

    def test_get_or_create_compliance_account_existing(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id="123456789012345"
        )
        holding_account = BCCRAccountResponseDetails(
            entity_id="123",
            organization_classification_id="456",
            type_of_account_holder="Corporation",
            trading_name="Test Corp",
        )
        compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        # Act
        result = service.get_or_create_compliance_account(
            holding_account_details=holding_account,
            compliance_report=compliance_report,
            compliance_report_version=compliance_report_version,
        )
        # Assert
        assert isinstance(result, BCCRComplianceAccountResponseDetails)
        assert result.entity_id == "123456789012345"
        assert result.master_account_name == "Test Corp"
        mock_api_client.create_sub_account.assert_not_called()

    def test_validate_holding_account_ownership_with_existing_subaccount_valid(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id", id="24-0019"),
            status=Operation.Statuses.REGISTERED,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report",
            bccr_subaccount_id="987654321012345",
            report__operation=operation,
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )

        # Mock sub-account details with matching master account
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "987654321012345",
                    "masterAccountId": 123456789012345,  # Matches holding account
                }
            ]
        }

        # Act
        result = service.validate_holding_account_ownership(
            holding_account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
        )

        # Assert
        assert result is True
        mock_api_client.get_account_details.assert_called_once_with(account_id="987654321012345")

    def test_validate_holding_account_ownership_with_existing_subaccount_invalid(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id", id="24-0019"),
            status=Operation.Statuses.REGISTERED,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report",
            bccr_subaccount_id="987654321012345",
            report__operation=operation,
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )

        # Mock sub-account details with different master account
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "987654321012345",
                    "masterAccountId": 999999999999999,  # Different holding account
                }
            ]
        }

        # Act
        result = service.validate_holding_account_ownership(
            holding_account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
        )

        # Assert
        assert result is False
        mock_api_client.get_account_details.assert_called_once_with(account_id="987654321012345")

    def test_validate_holding_account_ownership_no_existing_subaccount_valid(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id", id="24-0019"),
            status=Operation.Statuses.REGISTERED,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id=None, report__operation=operation
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )

        # Mock holding account details
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "123456789012345",
                    "organizationClassificationId": "456",
                    "type_of_account_holder": "Corporation",
                    "tradingName": "Test Corp",
                }
            ]
        }

        # Mock compliance account search returning a result (valid ownership)
        mock_api_client.get_compliance_account.return_value = {
            "entities": [
                {
                    "entityId": "999",
                }
            ]
        }

        # Act
        result = service.validate_holding_account_ownership(
            holding_account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
        )

        # Assert
        assert result is True
        mock_api_client.get_compliance_account.assert_called_once()

    def test_validate_holding_account_ownership_no_existing_subaccount_invalid(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id", id="24-0019"),
            status=Operation.Statuses.REGISTERED,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id=None, report__operation=operation
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )

        # Mock holding account details
        mock_api_client.get_account_details.return_value = {
            "entities": [
                {
                    "entityId": "123456789012345",
                    "organizationClassificationId": "456",
                    "type_of_account_holder": "Corporation",
                    "tradingName": "Test Corp",
                }
            ]
        }

        # Mock compliance account search returning no result (invalid ownership)
        mock_api_client.get_compliance_account.return_value = {"entities": []}

        # Act
        result = service.validate_holding_account_ownership(
            holding_account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
        )

        # Assert
        assert result is False
        mock_api_client.get_compliance_account.assert_called_once()

    def test_validate_holding_account_ownership_holding_account_not_found(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id", id="24-0019"),
            status=Operation.Statuses.REGISTERED,
        )
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", bccr_subaccount_id=None, report__operation=operation
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
        )

        # Mock holding account not found
        mock_api_client.get_account_details.return_value = {"entities": []}

        # Act
        result = service.validate_holding_account_ownership(
            holding_account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
        )

        # Assert
        assert result is False

    def test_get_or_create_compliance_account_new(self, service, mock_api_client):
        # Arrange
        service.client = mock_api_client
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
        )
        report = baker.make_recipe("reporting.tests.utils.report", operation=operation)
        compliance_report = baker.make_recipe(
            "compliance.tests.utils.compliance_report", report=report, bccr_subaccount_id=None
        )

        # Create the required relationships for compliance_report_version
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report=report)
        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            operation_name="Test Operation Name",
        )
        report_compliance_summary = baker.make_recipe(
            "reporting.tests.utils.report_compliance_summary", report_version=report_version
        )
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
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
            holding_account_details=holding_account,
            compliance_report=compliance_report,
            compliance_report_version=compliance_report_version,
        )
        # Assert
        assert isinstance(result, BCCRComplianceAccountResponseDetails)
        assert result.entity_id == "789"
        assert result.master_account_name == "Parent Corp"
        mock_api_client.create_sub_account.assert_called_once()
