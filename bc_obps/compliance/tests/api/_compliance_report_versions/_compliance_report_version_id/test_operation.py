from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper

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
        test_data = ComplianceTestHelper.build_test_data()
        approved_user_operator = make_recipe(
            'registration.tests.utils.approved_user_operator', operator=test_data.operation.operator
        )
        # create the report_operation linked to the report_version
        make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=test_data.report_version,
            operation_name='reporting name',
        )

        # Act
        # Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(test_data.compliance_report_version.id),
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
