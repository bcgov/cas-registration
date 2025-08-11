from enum import Enum
from typing import Optional
from uuid import UUID
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from compliance.models import ComplianceReportVersion


class UserStatusEnum(Enum):
    REGISTERED = "Registered"
    INVALID = "Invalid"


class UserComplianceAccessService:
    """
    Service for user app access
    """

    @classmethod
    def determine_user_compliance_status(cls, user_guid: UUID, compliance_report_version_id: Optional[int]) -> str:
        """
        Determines the user's access status to the compliance application or to a specific compliance report version.

        Args:
            user_guid (UUID): The GUID of the current user making the request.
            compliance_report_version_id (Optional[int]): ID of the compliance report version (if applicable).

        Returns:
            str: The user's compliance access status, one of:
                - "Invalid" (if the user has no registered operation)
                - the status of the compliance report version (if provided and found)
                - "Registered" (fallback if operation is valid but no version ID or version not found)
        """

        # Get the operator associated with the current user
        operator = UserDataAccessService.get_operator_by_user(user_guid)

        # Check if the operator has a registered operation
        if not OperationDataAccessService.check_current_users_registered_operation(operator.id):
            return UserStatusEnum.INVALID.value

        # If a compliance report version ID is provided, check if it belongs to this operator
        if compliance_report_version_id:
            has_version = ComplianceReportVersion.objects.filter(
                id=compliance_report_version_id, compliance_report__report__operator=operator
            ).exists()

            if not has_version:
                return UserStatusEnum.INVALID.value

            # Only fetch the crv object when we actually need its status
            compliance_report_version = ComplianceDashboardService.get_compliance_report_version_by_id(
                user_guid, compliance_report_version_id
            )
            if compliance_report_version is None:
                return UserStatusEnum.INVALID.value
            return compliance_report_version.status

        return UserStatusEnum.REGISTERED.value
