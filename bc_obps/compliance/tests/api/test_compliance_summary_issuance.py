# from decimal import Decimal
# from unittest.mock import patch, MagicMock
# from model_bakery import baker
# from registration.tests.utils.helpers import CommonTestSetup, TestUtils
# from registration.utils import custom_reverse_lazy


# class TestComplianceSummaryIssuanceAPI(CommonTestSetup):
#     """
#     Test class for the Compliance Summary Issuance API endpoints.
#     Inherits from CommonTestSetup to utilize standard test setup functionality.
#     """

#     def setup_method(self):
#         """Set up test data including compliance summary and related objects."""
#         super().setup_method()

#         # Create a compliance summary with a single baker.make_recipe call
#         self.compliance_summary = baker.make_recipe('compliance.tests.utils.compliance_summary')

#         # Authorize the user for the operator
#         TestUtils.authorize_current_user_as_operator_user(self, operator=self.compliance_summary.report.operator)

#     @patch(
#         'compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_issuance_data'
#     )
#     def test_get_compliance_summary_issuance(self, mock_get_issuance_data: MagicMock):
#         """Test the GET endpoint for retrieving compliance summary issuance data."""

#         self.compliance_summary.earned_credits = 100
#         self.compliance_summary.earned_credits_issued = False
#         self.compliance_summary.issuance_status = "Issuance not requested"
#         self.compliance_summary.excess_emissions_percentage = 87.5

#         mock_get_issuance_data.return_value = self.compliance_summary

#         # Make the API request
#         url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": self.compliance_summary.id})

#         # Use the standard auth role approach
#         response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

#         # Verify response status code
#         assert response.status_code == 200

#         # Verify response content
#         response_data = response.json()

#         # Verify the fields from the compliance summary are present
#         assert response_data["id"] == self.compliance_summary.id
#         assert (
#             Decimal(response_data["emissions_attributable_for_compliance"])
#             == self.compliance_summary.emissions_attributable_for_compliance
#         )
#         assert Decimal(response_data["emission_limit"]) == self.compliance_summary.emission_limit
#         assert Decimal(response_data["excess_emissions"]) == self.compliance_summary.excess_emissions

#         # Verify related objects
#         assert response_data["operation_name"] == self.compliance_summary.report.operation.name
#         assert response_data["reporting_year"] == self.compliance_summary.compliance_period.end_date.year

#         # Verify the service method was called with the correct parameters
#         mock_get_issuance_data.assert_called_once()

#     @patch('compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_by_id')
#     def test_get_compliance_summary_issuance_not_found(self, mock_get_summary_by_id):
#         """
#         Test that the API returns a 404 Not Found response when the compliance
#         summary does not exist.
#         """
#         mock_get_summary_by_id.return_value = None

#         url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": 9999})

#         response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

#         response_json = response.json()

#         assert response.status_code == 404
#         assert response_json["message"] == "Not Found"


#   @patch('compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_summary_issuance_data')
#   def test_get_compliance_summary_issuance_as_cas_staff(self, mock_get_issuance_data: MagicMock):
#       """Test the GET endpoint for retrieving compliance summary issuance data as CAS staff."""

#       self.compliance_summary.earned_credits = 100
#       self.compliance_summary.earned_credits_issued = False
#       self.compliance_summary.issuance_status = "Issuance requested, awaiting approval"
#       self.compliance_summary.excess_emissions_percentage = 87.5

#       mock_get_issuance_data.return_value = self.compliance_summary

#       # Make the API request
#       url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": self.compliance_summary.id})

#       # Test with CAS admin role
#       response = TestUtils.mock_get_with_auth_role(self, "cas_admin", url)

#       # Verify response status code
#       assert response.status_code == 200

#       # Verify response content
#       response_data = response.json()

#       # Verify the fields from the compliance summary are present
#       assert response_data["id"] == self.compliance_summary.id
#       assert (
#           Decimal(response_data["emissions_attributable_for_compliance"])
#           == self.compliance_summary.emissions_attributable_for_compliance
#       )
#       assert Decimal(response_data["emission_limit"]) == self.compliance_summary.emission_limit
#       assert Decimal(response_data["excess_emissions"]) == self.compliance_summary.excess_emissions

#       # Verify related objects
#       assert response_data["operation_name"] == self.compliance_summary.report.operation.name
#       assert response_data["reporting_year"] == self.compliance_summary.compliance_period.end_date.year

#       # Verify the service method was called with the correct parameters
#       mock_get_issuance_data.assert_called_once()
