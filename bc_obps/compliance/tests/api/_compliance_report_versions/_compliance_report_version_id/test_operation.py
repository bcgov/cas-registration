from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

VALIDATE_VERSION_OWNERSHIP_PATH = "compliance.api.permissions._validate_version_ownership_in_url"


class TestReportOperationByComplianceReportVersionEndpoint(CommonTestSetup):
    @staticmethod
    def _get_endpoint_url(compliance_report_version_id):
        return custom_reverse_lazy(
            "get_operation_by_compliance_report_version_id",
            kwargs={"compliance_report_version_id": compliance_report_version_id},
        )

    def test_successful_report_operation_retrieval(self):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        operation = make_recipe(
            'registration.tests.utils.operation', name='admin name', operator=approved_user_operator.operator
        )
        report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=approved_user_operator.operator
        )
        report_version = make_recipe('reporting.tests.utils.report_version', report=report)

        # create the report_operation linked to the report_version
        make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=report_version,
            operation_name='reporting name',
        )

        report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        # Act
        # Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )
        # Assert
        assert response.status_code == 200
        assert response.json() == {"operation_name": 'reporting name'}

    @patch(VALIDATE_VERSION_OWNERSHIP_PATH, return_value=True)
    def test_invalid_compliance_report_version_id(self, _):
        # Arrange
        invalid_compliance_report_version_id = 99999  # Assuming this ID does not exist in the database
        # Act
        # Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=make_recipe('registration.tests.utils.operator')
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(invalid_compliance_report_version_id),
        )
        # Assert
        assert response.status_code == 404
        assert response.json() == {'message': 'Not Found'}
