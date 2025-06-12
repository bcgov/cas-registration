from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.bakers import user_baker

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.api.validate_user_reporting_access import UserStatusEnum


class TestValidateUserReportingAccessApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.endpoint_under_test = "validate_user_reporting_access"
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch(
        "registration.api._user_operators._current.has_registered_operation.get_current_user_operator_has_registered_operation"
    )
    @patch("common.api.utils.get_current_user_guid")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_operator_by_user")
    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.check_current_users_reporting_registered_operation"
    )
    def test_returns_not_registered_if_no_registered_operation(
        self,
        mock_check_reporting: MagicMock | AsyncMock,
        mock_get_operator: MagicMock | AsyncMock,
        mock_get_current_user: MagicMock | AsyncMock,
        mock_get_registered: MagicMock | AsyncMock,
    ):
        # Simulate that the current user does NOT have any registered operation.
        mock_get_registered.return_value = (None, False)
        # Dummy operator for if any subsequent lookup occurs.
        dummy_operator = baker.make_recipe("registration.tests.utils.operator")
        mock_get_operator.return_value = dummy_operator
        mock_check_reporting.return_value = False
        mock_get_current_user.return_value = user_baker()
        # Build the URL with report_version_id set to "null"
        url = custom_reverse_lazy(self.endpoint_under_test) + "?report_version_id=null"
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        assert response.json() == {"status": UserStatusEnum.NOT_REGISTERED.value}

    @patch(
        "registration.api._user_operators._current.has_registered_operation.get_current_user_operator_has_registered_operation"
    )
    @patch("reporting.models.report_version.ReportVersion.objects.filter")
    def test_returns_registered_and_valid_if_report_version_exists(
        self, mock_filter: MagicMock, mock_get_registered: MagicMock
    ):
        # Simulate that there is a registered operation.
        mock_get_registered.return_value = (None, True)
        # Simulate that the report version exists.
        mock_filter.return_value.exists.return_value = True

        url = custom_reverse_lazy(self.endpoint_under_test) + f"?report_version_id={self.report_version.id}"
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        # Expect "REGISTERED_AND_VALID" when provided report_version_id exists.
        assert response.json() == {"status": UserStatusEnum.REGISTERED_AND_VALID.value}

    @patch(
        "registration.api._user_operators._current.has_registered_operation.get_current_user_operator_has_registered_operation"
    )
    @patch("reporting.models.report_version.ReportVersion.objects.filter")
    def test_returns_registered_and_invalid_if_report_version_does_not_exist(
        self, mock_filter: MagicMock, mock_get_registered: MagicMock
    ):
        # Simulate that there is a registered operation.
        mock_get_registered.return_value = (None, True)
        # Simulate that the report version does NOT exist.
        mock_filter.return_value.exists.return_value = False

        url = custom_reverse_lazy(self.endpoint_under_test) + "?report_version_id=nonexistent"
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        # Expect "REGISTERED_AND_INVALID" when report_version_id is provided but Not Found
        assert response.json() == {"status": UserStatusEnum.REGISTERED_AND_INVALID.value}

    @patch(
        "registration.api._user_operators._current.has_registered_operation.get_current_user_operator_has_registered_operation"
    )
    @patch("service.data_access_service.user_service.UserDataAccessService.get_operator_by_user")
    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.check_current_users_reporting_registered_operation"
    )
    def test_returns_registered_when_no_report_version_id_and_valid_reporting_registered_op(
        self,
        mock_check_reporting: MagicMock,
        mock_get_operator: MagicMock,
        mock_get_registered: MagicMock,
    ):
        # Simulate that the user does have a registered operation.
        mock_get_registered.return_value = (None, True)
        # Simulate returning an operator from the current user.
        operator = baker.make_recipe("registration.tests.utils.operator")
        mock_get_operator.return_value = operator
        # Simulate that the operator has at least one valid reporting registered operation.
        mock_check_reporting.return_value = True

        # Build a URL without a report_version_id query parameter.
        url = custom_reverse_lazy(self.endpoint_under_test)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        # Expect a status of "REGISTERED" when no report_version_id is provided and reporting op is valid.
        assert response.json() == {"status": UserStatusEnum.REGISTERED.value}

    @patch(
        "registration.api._user_operators._current.has_registered_operation.get_current_user_operator_has_registered_operation"
    )
    @patch("service.data_access_service.user_service.UserDataAccessService.get_operator_by_user")
    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.check_current_users_reporting_registered_operation"
    )
    def test_returns_not_registered_if_no_valid_reporting_registered_op(
        self,
        mock_check_reporting: MagicMock,
        mock_get_operator: MagicMock,
        mock_get_registered: MagicMock,
    ):
        # Simulate that the user has a registered operation overall.
        mock_get_registered.return_value = (None, True)
        # Return a dummy operator.
        operator = baker.make_recipe("registration.tests.utils.operator")
        mock_get_operator.return_value = operator
        # Simulate that no valid reporting registered operation exists.
        mock_check_reporting.return_value = False

        url = custom_reverse_lazy(self.endpoint_under_test)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        # Expect "NOT_REGISTERED" since reporting registered operation check fails.
        assert response.json() == {"status": UserStatusEnum.NOT_REGISTERED.value}
