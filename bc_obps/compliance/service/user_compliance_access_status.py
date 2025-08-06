from enum import Enum
from typing import Optional
from uuid import UUID
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService

class UserStatusEnum(Enum):
    REGISTERED = "Registered"
    INVALID = "Invalid"

class UserComplianceAccessStatus:
    """
    Service for user app access status
    """
        
    @classmethod
    def get_user_compliance_access_status(
        cls, user_guid: UUID, compliance_report_version_id: Optional[int]
    ) -> str:
        """
        Determines the user's access status to the compliance application and a specific compliance report version.

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
        has_registered_operation = OperationDataAccessService.check_current_users_registered_operation(operator.id)

        # If no operation is registered, the user is not allowed access
        if not has_registered_operation:
            return UserStatusEnum.INVALID.value

        # If a compliance report version ID is provided, try to fetch it
        if compliance_report_version_id:
            compliance_report_version = ComplianceDashboardService.get_compliance_report_version_by_id(
                user_guid, compliance_report_version_id
            )

        # If a report version ID is provided, check its validity and ownership
        if compliance_report_version_id:
            compliance_report_version = ComplianceDashboardService.get_compliance_report_version_by_id(
                user_guid, compliance_report_version_id
            )
            if compliance_report_version:
                return compliance_report_version.status
            else:
                return UserStatusEnum.INVALID.value  # Explicitly invalid if version is not found or not owned

        # Here the user has a registered operation but no valid report version, return generic registered status
        return UserStatusEnum.REGISTERED.value
