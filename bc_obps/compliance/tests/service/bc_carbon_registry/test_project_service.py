from decimal import Decimal
import pytest
from unittest.mock import patch
from model_bakery import baker
from compliance.service.bc_carbon_registry.project_service import BCCarbonRegistryProjectService
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
from compliance.models import ComplianceEarnedCredit
from registration.models import Operation
from common.exceptions import UserError

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_api_client():
    with patch('compliance.service.bc_carbon_registry.bc_carbon_registry_api_client.BCCarbonRegistryAPIClient') as mock:
        yield mock.return_value


@pytest.fixture
def service(mock_api_client):
    service_instance = BCCarbonRegistryProjectService()
    # Replace the client instance with our mock
    service_instance.client = mock_api_client
    return service_instance


@pytest.fixture
def sfo_operation():
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.SFO,
        status=Operation.Statuses.REGISTERED,
    )
    facility = baker.make_recipe(
        "registration.tests.utils.facility",
        latitude_of_largest_emissions=Decimal("49.2827"),
        longitude_of_largest_emissions=Decimal("-123.1207"),
    )
    operation.facilities.add(facility)
    return operation


@pytest.fixture
def lfo_operation():
    mailing_address = baker.make_recipe(
        "registration.tests.utils.address",
        municipality="Vancouver",
        street_address="123 Main St",
        postal_code="V6B 1A1",
        province="BC",
    )
    operator = baker.make_recipe("registration.tests.utils.operator", mailing_address=mailing_address)
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.LFO,
        operator=operator,
        status=Operation.Statuses.REGISTERED,
    )
    return operation


@pytest.fixture
def lfo_operation_missing_address():
    operator = baker.make_recipe("registration.tests.utils.operator", mailing_address=None)
    # No mailing address set
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.LFO,
        operator=operator,
        status=Operation.Statuses.REGISTERED,
    )
    return operation


@pytest.fixture
def lfo_operation_incomplete_address():
    mailing_address = baker.make_recipe(
        "registration.tests.utils.address",
        municipality="Vancouver",
        street_address="",  # Missing street address
        postal_code="V6B 1A1",
        province="BC",
    )
    operator = baker.make_recipe("registration.tests.utils.operator", mailing_address=mailing_address)
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.LFO,
        operator=operator,
        status=Operation.Statuses.REGISTERED,
    )
    return operation


@pytest.fixture
def sfo_operation_missing_coordinates():
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.SFO,
        status=Operation.Statuses.REGISTERED,
    )
    facility = baker.make_recipe(
        "registration.tests.utils.facility",
        latitude_of_largest_emissions=None,  # Missing coordinates
        longitude_of_largest_emissions=None,
    )
    operation.facilities.add(facility)
    return operation


@pytest.fixture
def sfo_operation_no_facility():
    operation = baker.make_recipe(
        "registration.tests.utils.operation",
        type=Operation.Types.SFO,
        status=Operation.Statuses.REGISTERED,
    )
    # No facility added
    return operation


def create_compliance_report_version_with_earned_credit(operation, issuance_status=None, bccr_trading_name=None):
    report = baker.make_recipe("reporting.tests.utils.report", operation=operation)
    compliance_report = baker.make_recipe("compliance.tests.utils.compliance_report", report=report)
    compliance_report_version = baker.make_recipe(
        "compliance.tests.utils.compliance_report_version", compliance_report=compliance_report
    )

    # Create earned credit with specified status and trading name
    baker.make_recipe(
        "compliance.tests.utils.compliance_earned_credit",
        compliance_report_version=compliance_report_version,
        issuance_status=issuance_status or ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        bccr_trading_name=bccr_trading_name,
    )

    return compliance_report_version


@pytest.fixture
def standard_payload():
    return {
        "bccr_holding_account_id": "123456789012345",
        "bccr_trading_name": "Test Trading Company",
    }


class TestBCCarbonRegistryProjectService:
    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    @patch.object(ComplianceEarnedCreditsService, 'update_earned_credit_for_bccr_project')
    def test_create_project_sfo_operation_success(
        self,
        mock_update_earned_credit,
        mock_validate_earned_credit,
        service,
        mock_api_client,
        sfo_operation,
        standard_payload,
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(sfo_operation)
        mock_api_client.create_project.return_value = {"id": "project_123"}
        mock_validate_earned_credit.return_value = None
        mock_update_earned_credit.return_value = None

        # Act
        service.create_project(
            account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
            payload=standard_payload,
        )

        # Assert
        # Verify validation was called first
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)

        # Verify API call was made
        mock_api_client.create_project.assert_called_once()
        call_args = mock_api_client.create_project.call_args[1]["project_data"]

        # Verify project data structure
        assert call_args["account_id"] == "123456789012345"
        assert (
            call_args["project_name"]
            == f"{sfo_operation.name} {compliance_report_version.compliance_report.compliance_period.end_date.year}"
        )

        # Verify SFO-specific address fields
        assert "latitude" in call_args["mixedUnitList"][0]
        assert "longitude" in call_args["mixedUnitList"][0]
        assert call_args["mixedUnitList"][0]["latitude"] == Decimal('49.2827')
        assert call_args["mixedUnitList"][0]["longitude"] == Decimal('-123.1207')

        # Verify earned credit update was called
        mock_update_earned_credit.assert_called_once_with(compliance_report_version.id, "Test Trading Company")

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    @patch.object(ComplianceEarnedCreditsService, 'update_earned_credit_for_bccr_project')
    def test_create_project_lfo_operation_success(
        self,
        mock_update_earned_credit,
        mock_validate_earned_credit,
        service,
        mock_api_client,
        lfo_operation,
        standard_payload,
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(lfo_operation)
        mock_api_client.create_project.return_value = {"id": "project_123"}
        mock_validate_earned_credit.return_value = None
        mock_update_earned_credit.return_value = None

        # Act
        service.create_project(
            account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
            payload=standard_payload,
        )

        # Assert
        # Verify validation was called first
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)

        # Verify API call was made
        mock_api_client.create_project.assert_called_once()
        call_args = mock_api_client.create_project.call_args[1]["project_data"]

        # Verify project data structure
        assert call_args["account_id"] == "123456789012345"
        assert (
            call_args["project_name"]
            == f"{lfo_operation.name} {compliance_report_version.compliance_report.compliance_period.end_date.year}"
        )

        # Verify LFO-specific address fields
        assert "city" in call_args["mixedUnitList"][0]
        assert "address_line_1" in call_args["mixedUnitList"][0]
        assert "zipcode" in call_args["mixedUnitList"][0]
        assert "province" in call_args["mixedUnitList"][0]
        assert call_args["mixedUnitList"][0]["city"] == "Vancouver"
        assert call_args["mixedUnitList"][0]["address_line_1"] == "123 Main St"
        assert call_args["mixedUnitList"][0]["zipcode"] == "V6B 1A1"
        assert call_args["mixedUnitList"][0]["province"] == "BC"

        # Verify earned credit update was called
        mock_update_earned_credit.assert_called_once_with(compliance_report_version.id, "Test Trading Company")

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_invalid_operation_type(
        self, mock_validate_earned_credit, service, mock_api_client, standard_payload
    ):
        # Arrange
        operation = baker.make_recipe(
            "registration.tests.utils.operation",
            type=Operation.Types.EIO,  # Invalid type for project creation
        )
        compliance_report_version = create_compliance_report_version_with_earned_credit(operation)
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(UserError, match="Operation type must be SFO or LFO to create a project in BCCR."):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_bccr_api_failure(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(sfo_operation)
        mock_api_client.create_project.return_value = {}
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(UserError, match="Failed to create project in BCCR"):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called and API was called but failed
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_called_once()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_earned_credit_validation_failure(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(sfo_operation)
        mock_validate_earned_credit.side_effect = UserError("Earned credit validation failed")

        # Act & Assert
        with pytest.raises(UserError, match="Earned credit validation failed"):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_earned_credit_already_has_trading_name(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(
            sfo_operation, bccr_trading_name="Existing Trading Name"
        )
        mock_validate_earned_credit.side_effect = UserError("Earned credit already has a BCCR trading name")

        # Act & Assert
        with pytest.raises(UserError, match="Earned credit already has a BCCR trading name"):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_no_earned_credit_record(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation, standard_payload
    ):
        # Arrange
        report = baker.make_recipe("reporting.tests.utils.report", operation=sfo_operation)
        compliance_report = baker.make_recipe("compliance.tests.utils.compliance_report", report=report)
        compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version", compliance_report=compliance_report
        )
        mock_validate_earned_credit.side_effect = UserError(
            "No earned credit record found for this compliance report version"
        )

        # Act & Assert
        with pytest.raises(UserError, match="No earned credit record found for this compliance report version"):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_sfo_missing_coordinates(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation_missing_coordinates, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(
            sfo_operation_missing_coordinates
        )
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(UserError, match="Facility must have latitude and longitude for SFO operations."):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_sfo_no_facility(
        self, mock_validate_earned_credit, service, mock_api_client, sfo_operation_no_facility, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(sfo_operation_no_facility)
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(UserError, match="SFO operation must have at least one facility."):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_lfo_missing_mailing_address(
        self, mock_validate_earned_credit, service, mock_api_client, lfo_operation_missing_address, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(lfo_operation_missing_address)
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(UserError, match="Operator must have a mailing address for LFO operations."):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    def test_create_project_lfo_incomplete_address(
        self, mock_validate_earned_credit, service, mock_api_client, lfo_operation_incomplete_address, standard_payload
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(
            lfo_operation_incomplete_address
        )
        mock_validate_earned_credit.return_value = None

        # Act & Assert
        with pytest.raises(
            UserError,
            match="Mailing address must have street address, municipality, and postal code for LFO operations.",
        ):
            service.create_project(
                account_id="123456789012345",
                compliance_report_version_id=compliance_report_version.id,
                payload=standard_payload,
            )

        # Verify validation was called but API client was not called since validation failed early
        mock_validate_earned_credit.assert_called_once_with(compliance_report_version.id)
        mock_api_client.create_project.assert_not_called()

    @patch.object(ComplianceEarnedCreditsService, 'validate_earned_credit_for_bccr_project')
    @patch.object(ComplianceEarnedCreditsService, 'update_earned_credit_for_bccr_project')
    def test_project_description_format(
        self,
        mock_update_earned_credit,
        mock_validate_earned_credit,
        service,
        mock_api_client,
        sfo_operation,
        standard_payload,
    ):
        # Arrange
        compliance_report_version = create_compliance_report_version_with_earned_credit(sfo_operation)
        mock_api_client.create_project.return_value = {"id": "project_123"}
        mock_validate_earned_credit.return_value = None
        mock_update_earned_credit.return_value = None

        # Act
        service.create_project(
            account_id="123456789012345",
            compliance_report_version_id=compliance_report_version.id,
            payload=standard_payload,
        )

        # Assert
        call_args = mock_api_client.create_project.call_args[1]["project_data"]
        description = call_args["project_description"]

        operation_name = sfo_operation.name
        compliance_period_end_date_year = compliance_report_version.compliance_report.compliance_period.end_date.year
        expected_description = f"""
        The B.C. OBPS, established under the Greenhouse Gas Industrial Reporting and Control Act (GGIRCA), 
        is a carbon pricing system that incentivizes emission reductions through performance-based targets. 
        The Director under GGIRCA issued earned credits to {operation_name} because their verified emissions were below 
        their emission limit in {compliance_period_end_date_year} B.C. Output Based Pricing System (OBPS).
        """

        assert (
            description == expected_description
        ), f"Project description does not match expected format. Expected: {expected_description}, Got: {description}"
