from unittest.mock import patch
from django.core.exceptions import ObjectDoesNotExist

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestGetCurrentUserOperatorHasRegisteredRegulatedOperation(CommonTestSetup):
    @patch('registration.api._user_operators._current.has_registered_regulated_operation.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_registered_regulated_operation.OperationDataAccessService')
    def test_user_has_registered_regulated_operation(self, mock_operation_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator
        mock_operation_service.check_current_users_registered_regulated_operation.return_value = True

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_registered_regulated_operation")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_registered_regulated_operation": True}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
        mock_operation_service.check_current_users_registered_regulated_operation.assert_called_once_with(operator.id)

    @patch('registration.api._user_operators._current.has_registered_regulated_operation.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_registered_regulated_operation.OperationDataAccessService')
    def test_user_has_no_registered_regulated_operation(self, mock_operation_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator
        mock_operation_service.check_current_users_registered_regulated_operation.return_value = False

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_registered_regulated_operation")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_registered_regulated_operation": False}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
        mock_operation_service.check_current_users_registered_regulated_operation.assert_called_once_with(operator.id)

    @patch('registration.api._user_operators._current.has_registered_regulated_operation.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_registered_regulated_operation.OperationDataAccessService')
    def test_user_has_no_access_to_operator(self, mock_operation_service, mock_user_service):
        # Arrange
        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_user_service.get_operator_by_user.return_value = operator

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_registered_regulated_operation")
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_registered_regulated_operation": False}

    @patch('registration.api._user_operators._current.has_registered_regulated_operation.UserDataAccessService')
    @patch('registration.api._user_operators._current.has_registered_regulated_operation.OperationDataAccessService')
    def test_object_does_not_exist_exception(self, mock_operation_service, mock_user_service):
        # Arrange
        mock_user_service.get_operator_by_user.side_effect = ObjectDoesNotExist()

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_user_operator_has_registered_regulated_operation")
        )
        # Assert
        assert response.status_code == 200
        assert response.json() == {"has_registered_regulated_operation": False}
        mock_user_service.get_operator_by_user.assert_called_once_with(self.user.user_guid)
