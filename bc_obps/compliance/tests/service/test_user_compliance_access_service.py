import pytest
from uuid import uuid4
from unittest.mock import patch
from model_bakery import baker

from compliance.service.user_compliance_access_service import (
    UserComplianceAccessService,
    UserStatusEnum,
)

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

OPERATOR_GUID = uuid4()


@pytest.fixture
def user_guid():
    return uuid4()


@pytest.fixture
def mock_user_data_access():
    with patch(GET_OPERATOR_BY_USER_PATH) as mock:
        operator = baker.make_recipe("registration.tests.utils.operator", id=OPERATOR_GUID)
        mock.return_value = operator
        yield mock


@pytest.fixture
def mock_operation_data_access():
    with patch(CHECK_REGISTERED_OPERATION_PATH) as mock:
        mock.return_value = True
        yield mock


@pytest.fixture
def mock_dashboard_service():
    with patch(GET_REPORT_VERSION_BY_ID_PATH) as mock:
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
        mock_operation_data_access.return_value = False

        result = UserComplianceAccessService.determine_user_compliance_status(
            user_guid, compliance_report_version_id=None
        )

        assert result == UserStatusEnum.INVALID.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(OPERATOR_GUID)
        mock_dashboard_service.assert_not_called()

    def test_registered_no_version_id_returns_registered(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        mock_operation_data_access.return_value = True

        result = UserComplianceAccessService.determine_user_compliance_status(
            user_guid, compliance_report_version_id=None
        )

        assert result == UserStatusEnum.REGISTERED.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(OPERATOR_GUID)
        mock_dashboard_service.assert_not_called()

    def test_registered_with_version_found_returns_version_status(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: registered op, OWNED version exists with id=123
        mock_operation_data_access.return_value = True

        # Build the CRV hierarchy owned by the operator
        report = baker.make_recipe("compliance.tests.utils.report", operator_id=OPERATOR_GUID)
        compliance_report = baker.make_recipe("compliance.tests.utils.compliance_report", report=report)
        baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            id=123,
            compliance_report=compliance_report,
        )

        mock_dashboard_service.return_value = type("CRV", (), {"status": "Obligation not met"})

        # Act
        result = UserComplianceAccessService.determine_user_compliance_status(
            user_guid, compliance_report_version_id=123
        )

        # Assert
        assert result == "Obligation not met"
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(OPERATOR_GUID)
        mock_dashboard_service.assert_called_once_with(user_guid, 123)

    def test_registered_with_version_missing_returns_invalid(
        self,
        user_guid,
        mock_user_data_access,
        mock_operation_data_access,
        mock_dashboard_service,
    ):
        # Arrange: registered op, but NO owned CRV with id=999
        mock_operation_data_access.return_value = True

        # Act
        result = UserComplianceAccessService.determine_user_compliance_status(
            user_guid, compliance_report_version_id=999
        )

        # Assert
        assert result == UserStatusEnum.INVALID.value
        mock_user_data_access.assert_called_once_with(user_guid)
        mock_operation_data_access.assert_called_once_with(OPERATOR_GUID)
        # Since ownership failed, dashboard should NOT be called
        mock_dashboard_service.assert_not_called()
