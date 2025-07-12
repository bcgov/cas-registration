from decimal import Decimal
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch


class TestComplianceReportVersionsEndpoint(CommonTestSetup):
    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_versions_for_dashboard"
    )
    def test_get_compliance_report_versions_list_success(self, mock_get_versions):
        # Arrange
        version1 = make_recipe('compliance.tests.utils.compliance_report_version')
        version1.report_compliance_summary.excess_emissions = Decimal("50.0000")
        version1.report_compliance_summary.save()

        version2 = make_recipe('compliance.tests.utils.compliance_report_version')
        version2.report_compliance_summary.excess_emissions = Decimal("75.0000")
        version2.report_compliance_summary.save()

        # Mock the service to return both versions
        mock_get_versions.return_value = [version1, version2]
        TestUtils.authorize_current_user_as_operator_user(self, operator=version1.compliance_report.report.operator)

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_compliance_report_versions_list"),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the paginated response structure
        assert response_data.keys() == {'count', 'items'}
        assert response_data['count'] == 2

        # Verify the fields in both results
        items = response_data["items"]
        assert len(items) == 2, "Expected 2 results"

        # Verify first version
        assert items[0]["id"] == version1.id
        assert items[0]["status"] == version1.status
        assert items[0]["operation_name"] == version1.compliance_report.report.operation.name
        assert items[0]["reporting_year"] == version1.compliance_report.compliance_period.end_date.year
        assert Decimal(items[0]["excess_emissions"]) == Decimal("50.0000")

        # Verify second version
        assert items[1]["id"] == version2.id
        assert items[1]["status"] == version2.status
        assert items[1]["operation_name"] == version2.compliance_report.report.operation.name
        assert items[1]["reporting_year"] == version2.compliance_report.compliance_period.end_date.year
        assert Decimal(items[1]["excess_emissions"]) == Decimal("75.0000")
