from decimal import Decimal
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestComplianceSummaryIssuanceAPI(CommonTestSetup):
    """
    Test class for the Compliance Summary Issuance API endpoints.
    Inherits from CommonTestSetup to utilize standard test setup functionality.
    """

    def setup_method(self):
        """Set up test data including compliance summary and related objects."""
        super().setup_method()

        # Create a compliance summary with a single baker.make_recipe call
        self.compliance_summary = baker.make_recipe('compliance.tests.utils.compliance_summary')

        # Authorize the user for the operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.compliance_summary.report.operator)

    @patch(
        'service.compliance.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_issuance_data'
    )
    def test_get_compliance_summary_issuance(self, mock_get_issuance_data: MagicMock):
        """Test the GET endpoint for retrieving compliance summary issuance data."""

        self.compliance_summary.earned_credits = 100
        self.compliance_summary.earned_credits_issued = False
        self.compliance_summary.issuance_status = "Issuance not requested"
        self.compliance_summary.excess_emissions_percentage = 87.5

        mock_get_issuance_data.return_value = self.compliance_summary

        # Make the API request
        url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": self.compliance_summary.id})

        # Use the standard auth role approach
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        # Verify response status code
        assert response.status_code == 200

        # Verify response content
        response_data = response.json()

        # Verify the fields from the compliance summary are present
        assert response_data["id"] == self.compliance_summary.id
        assert (
            Decimal(response_data["emissions_attributable_for_compliance"])
            == self.compliance_summary.emissions_attributable_for_compliance
        )
        assert Decimal(response_data["emission_limit"]) == self.compliance_summary.emission_limit
        assert Decimal(response_data["excess_emissions"]) == self.compliance_summary.excess_emissions

        # Verify related objects
        assert response_data["operation_name"] == self.compliance_summary.report.operation.name
        assert response_data["reporting_year"] == self.compliance_summary.compliance_period.end_date.year

        # Verify the service method was called with the correct parameters
        mock_get_issuance_data.assert_called_once()

    def test_get_compliance_summary_issuance_not_found(self):
        """
        Test that the API returns a 404 Not Found response when the compliance
        summary does not exist.
        """
        from django.db import connection

        print("\n==== DEBUG: Starting test_get_compliance_summary_issuance_not_found ====")
        print(f"Database: {connection.settings_dict['NAME']} on {connection.settings_dict['HOST']}")

        # Check for database permissions
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1 FROM compliance_summary LIMIT 1")
                print("SUCCESS: Direct query to compliance_summary table worked")
        except Exception as e:
            print(f"ERROR: Database permission issue: {str(e)}")

        # Set up URL with a non-existent summary ID
        url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": 9999})  # Non-existent ID
        print(f"Request URL: {url}")

        # Make the API request
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        # Print response details
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.content}")

        if response.status_code == 500:
            print("ERROR: Received 500 error - checking for database permission issues")
            try:
                from compliance.models import ComplianceSummary

                test_query = ComplianceSummary.objects.filter(id=9999).exists()
                print(f"ComplianceSummary query test: {test_query}")
            except Exception as e:
                print(f"ERROR querying ComplianceSummary: {str(e)}")

        # Verify response status code
        assert response.status_code == 404, f"Expected 404, got {response.status_code}. Response: {response.content}"

        # Verify error message in response
        response_json = response.json()
        print(f"Response JSON: {response_json}")
        assert response_json["message"] == "Not Found"
        print("==== DEBUG: Test completed successfully ====")
