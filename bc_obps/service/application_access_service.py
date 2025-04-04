from typing import Dict, Optional
from uuid import UUID
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.emails import send_operator_access_request_email
from service.email.email_service import EmailService
from registration.models import UserOperator
from service.data_access_service.operator_service import OperatorDataAccessService
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService


email_service = EmailService()


class ApplicationAccessService:
    @classmethod
    def is_user_eligible_to_request_access(cls, operator_id: UUID, user_guid: UUID) -> Optional[bool]:
        """
        Check if the business_guid of a user who is requesting access to an operator matches the business_guid of the operator's admin

        Args:
            user_guid (UUID): The guid of the user for whom eligibility is being checked.
            operator_id (int): The id of the operator to which access is being requested.

        Returns:
            True or raises an exception.
        """
        operators_business_bceid = OperatorDataAccessService.get_operators_business_guid(operator_id)
        users_business_bceid = UserDataAccessService.get_by_guid(user_guid).business_guid

        if operators_business_bceid != users_business_bceid:
            raise Exception(
                "Your business BCeID does not have access to this operator. Please contact your operator's administrator to request the correct business BCeID. If this issue persists, please contact"
            )
        return True

    # check_users_admin_request_eligibility
    @classmethod
    def is_user_eligible_to_request_admin_access(
        cls,
        operator_id: UUID,
        user_guid: UUID,
    ) -> Optional[bool]:
        """
        Check if a user is eligible to request admin access to an operator.

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            operatorIid (uuid): The if of the operator to which admin access is being requested.

        Returns:
            True or raises an exception.
        """
        approved_admins = UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.APPROVED)
        if approved_admins.filter(user_guid=user_guid).exists():
            raise Exception("You are already an admin for this Operator!")
        if len(approved_admins) > 0:
            raise Exception("This Operator already has an admin user!")
        # User already has a pending request for this operator
        # NOTE: This is a bit of a weird case, but it's possible for a user to have a pending request for an operator and if we show the UserOperator request form, they could submit another request and end up with two
        pending_admins = UserOperatorDataAccessService.get_admin_users(operator_id, UserOperator.Statuses.PENDING)

        if pending_admins.filter(user_guid=user_guid).exists():
            raise Exception("You already have a pending request for this Operator!")

        return True

    @classmethod
    def request_access(cls, operator_id: UUID, user_guid: UUID) -> Dict[str, UUID]:
        if ApplicationAccessService.is_user_eligible_to_request_access(operator_id, user_guid):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)
            if created:
                send_operator_access_request_email(
                    AccessRequestStates.CONFIRMATION,
                    AccessRequestTypes.OPERATOR_WITH_ADMIN,
                    user_operator.operator.legal_name,
                    user_operator.user.get_full_name(),
                    user_operator.user.email,
                )

        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}

    @classmethod
    def request_admin_access(cls, operator_id: UUID, user_guid: UUID) -> Dict[str, UUID]:
        if ApplicationAccessService.is_user_eligible_to_request_admin_access(operator_id, user_guid):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)
            if created:
                send_operator_access_request_email(
                    AccessRequestStates.CONFIRMATION,
                    AccessRequestTypes.ADMIN,
                    user_operator.operator.legal_name,
                    user_operator.user.get_full_name(),
                    user_operator.user.email,
                )
        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
