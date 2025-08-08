import pytest
from uuid import uuid4
from types import SimpleNamespace
from unittest.mock import patch, Mock

from compliance.service.user_compliance_access_service import UserComplianceAccessService, UserStatusEnum

pytestmark = pytest.mark.django_db

# Base import path for the service under test
BASE_PATH = "compliance.service.user_compliance_access_service"

# Dependencies to patch (as imported/used in the service module)
USER_DATA_ACCESS_PATH = f"{BASE_PATH}.UserDataAccessService"
OPERATION_DATA_ACCESS_PATH = f"{BASE_PATH}.OperationDataAccessService"
DASHBOARD_SERVICE_PATH = f"{BASE_PATH}.ComplianceDashboardService"

# Method paths to patch
GET_OPERATOR_BY_USER_PATH = f"{USER_DATA_ACCESS_PATH}.get_operator_by_user"
CHECK_REGISTERED_OPERATION_PATH = f"{OPERATION_DATA_ACCESS_PATH}.check_current_users_registered_operation"
GET_REPORT_VERSION_BY_ID_PATH = f"{DASHBOARD_SERVICE_PATH}.get_compliance_report_version_by_id"


@pytest.fixture
def user_guid():
    return uuid4()


@pytest.fixture
def mock_user_data_access():
    """Patch UserDataAccessService.get_operator_by_user"""
    with patch(GET_OPERATOR_BY_USER_PATH) as mock:
        # Return a minimal operator with an id
        mock.return_value = SimpleNamespace(id=42)
        yield mock


@pytest.fixture
def mock_operation_data_access():
    """Patch OperationDataAccessService.check_current_users_registered_operation"""
    with patch(CHECK_REGISTERED_OPERATION_PATH) as mock:
        # default: True, override in tests when needed
        mock.return_value = True
        yield mock


@pytest.fixture
def mock_dashboard_service():
    """Patch ComplianceDashboardService.get_compliance_report_version_by_id"""
    with patch(GET_REPORT_VERSION_BY_ID_PATH) as mock:
        # default: None, override per test
        mock.return_value = None
        yield mock


class TestUserComplianceAccessService:
    def test_no_registered_operation_returns_invalid(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: no registered operation
        mock_operation_data_access.return_value = False

        # Act
        result = UserComplianceAccessService.determine_user_status(user_guid, compliance_report_version_id=None)

        # Assert
        assert result == UserStatusEnum.INVALID.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(42)
        # Should not even try to fetch a version
        mock_dashboard_service.assert_not_called()

    def test_registered_no_version_id_returns_registered(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: registered op, no version id
        mock_operation_data_access.return_value = True

        # Act
        result = UserComplianceAccessService.determine_user_status(user_guid, compliance_report_version_id=None)

        # Assert
        assert result == UserStatusEnum.REGISTERED.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(42)
        mock_dashboard_service.assert_not_called()

    def test_registered_with_version_found_returns_version_status(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: registered op, version id present and found
        mock_operation_data_access.return_value = True
        mock_dashboard_service.return_value = SimpleNamespace(status="Obligation not met")

        # Act
        result = UserComplianceAccessService.determine_user_status(user_guid, compliance_report_version_id=123)

        # Assert
        assert result == "Obligation not met"
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(42)
        mock_dashboard_service.assert_called_once_with(user_guid, 123)

    def test_registered_with_version_missing_returns_invalid(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: registered op, version id present but not found / not owned
        mock_operation_data_access.return_value = True
        mock_dashboard_service.return_value = None

        # Act
        result = UserComplianceAccessService.determine_user_status(user_guid, compliance_report_version_id=999)

        # Assert
        assert result == UserStatusEnum.INVALID.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(42)
        mock_dashboard_service.assert_called_once_with(user_guid, 999)
