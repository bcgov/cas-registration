from unittest.mock import patch
from django.core.exceptions import ObjectDoesNotExist

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestGetCurrentUserOperatorHasComplianceReports(CommonTestSetup):
    @patch('registration.api._user_operators._current.has_compliance_reports.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_compliance_reports.OperatorDataAccessService')
    def test_user_has_compliance_reports(self, mock_operator_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator
        mock_operator_service.check_operator_has_compliance_reports.return_value = True

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_compliance_reports")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_compliance_reports": True}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
        mock_operator_service.check_operator_has_compliance_reports.assert_called_once_with(operator.id)

    @patch('registration.api._user_operators._current.has_compliance_reports.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_compliance_reports.OperatorDataAccessService')
    def test_user_has_no_compliance_reports(self, mock_operator_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator
        mock_operator_service.check_operator_has_compliance_reports.return_value = False

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_compliance_reports")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_compliance_reports": False}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
        mock_operator_service.check_operator_has_compliance_reports.assert_called_once_with(operator.id)

    @patch('registration.api._user_operators._current.has_compliance_reports.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_compliance_reports.OperatorDataAccessService')
    def test_user_has_no_access_to_operator(self, mock_operator_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_compliance_reports")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_compliance_reports": False}

    @patch('registration.api._user_operators._current.has_compliance_reports.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_compliance_reports.OperatorDataAccessService')
    def test_object_does_not_exist_exception(self, mock_operator_service, mock_user_service):
        # Arrange
        mock_user_service.get_operator_by_user.side_effect = ObjectDoesNotExist()

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_compliance_reports")
        )
        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_compliance_reports": False}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
