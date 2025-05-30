from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestComplianceReportVersionEndpoint(CommonTestSetup):
    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_version_by_id"
    )
    def test_get_compliance_report_version_success(self, mock_get_version):
        # Arrange
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary__excess_emissions=Decimal("50.0000"),
            report_compliance_summary__credited_emissions=Decimal("25.0000"),
            status="Obligation not met",
        )
        compliance_report_version.outstanding_balance = Decimal("100.0000")
        mock_get_version.return_value = compliance_report_version

        # Mock authorization
        operator = compliance_report_version.compliance_report.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        # Act
        endpoint = custom_reverse_lazy(
            "get_compliance_report_version",
            kwargs={"compliance_report_version_id": compliance_report_version.id},
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint)

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response data
        assert response_data["id"] == compliance_report_version.id
        assert response_data["status"] == compliance_report_version.status
        assert response_data["operation_name"] == compliance_report_version.compliance_report.report.operation.name
        assert (
            response_data["reporting_year"]
            == compliance_report_version.compliance_report.compliance_period.end_date.year
        )
        assert Decimal(response_data["excess_emissions"]) == Decimal("50.0000")
        assert Decimal(response_data["credited_emissions"]) == Decimal("25.0000")
        assert Decimal(response_data["outstanding_balance"]) == Decimal("100.0000")
