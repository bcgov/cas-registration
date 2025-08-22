from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.models import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from reporting.models.reporting_year import ReportingYear


class TestObligationTasklistEndpoint(CommonTestSetup):
    @staticmethod
    def _get_endpoint_url(compliance_report_version_id):
        return custom_reverse_lazy(
            "get_obligation_tasklist_data",
            kwargs={"compliance_report_version_id": compliance_report_version_id},
        )

    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_successful_tasklist_retrieval_with_outstanding_balance(self, mock_get_reporting_year):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # Create compliance report version
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=approved_user_operator.operator,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        # Create elicensing invoice with outstanding balance
        elicensing_invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            outstanding_balance=Decimal("1000.50"),
        )

        # Create compliance obligation
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=compliance_report_version,
            elicensing_invoice=elicensing_invoice,
            penalty_status=ComplianceObligation.PenaltyStatus.ACCRUING,
        )

        # Mock reporting year service
        mock_get_reporting_year.return_value = ReportingYear.objects.get(reporting_year=2024)

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["status"] == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert response_data["penalty_status"] == ComplianceObligation.PenaltyStatus.ACCRUING
        assert response_data["outstanding_balance"] == "1000.50"
        assert response_data["reporting_year"] == 2024

        # Verify service was called
        mock_get_reporting_year.assert_called_once()

    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_successful_tasklist_retrieval_without_outstanding_balance(self, mock_get_reporting_year):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # Create compliance report version
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=approved_user_operator.operator,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
        )

        # Create compliance obligation without elicensing invoice
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=compliance_report_version,
            elicensing_invoice=None,
            penalty_status=ComplianceObligation.PenaltyStatus.NONE,
        )

        # Mock reporting year service
        mock_get_reporting_year.return_value = ReportingYear.objects.get(reporting_year=2024)

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["status"] == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
        assert response_data["penalty_status"] == ComplianceObligation.PenaltyStatus.NONE
        assert response_data["outstanding_balance"] is None
        assert response_data["reporting_year"] == 2024

        # Verify service was called
        mock_get_reporting_year.assert_called_once()

    @patch("common.permissions.validate_all", return_value=True)
    def test_invalid_compliance_report_version_id(self, _):
        # Arrange
        invalid_compliance_report_version_id = 99999  # Assuming this ID does not exist in the database

        # Act
        # approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        # TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(invalid_compliance_report_version_id),
        )

        # Assert
        assert response.status_code == 404
