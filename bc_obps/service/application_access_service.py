from uuid import UUID
from registration.schema.user_operator import UserOperatorOut
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService


class ApplicationAccessService:
    def get_operators_business_guid(operator_id: UUID):
        # all approved admins will have the same business_guid so we can use first one
        return UserOperatorDataAccessService.get_approved_admin_users(operator_id).first().business_guid

    def does_user_belong_to_operator(operator_id: int, user_guid: UUID):
        """
        Check if the business_guid of a user who is requesting access to an operator matches the business_guid of the operator's admin

        Args:
            user_guid (UUID): The guid of the user for whom eligibility is being checked.
            operator_id (int): The id of the operator to which access is being requested.

        Returns:
            True or raises an exception.
        """
        operators_business_bceid = ApplicationAccessService.get_operators_business_guid(operator_id)
        users_business_bceid = UserDataAccessService.get_user_by_guid(user_guid).business_guid

        if operators_business_bceid != users_business_bceid:
            # brianna this worked great
            raise Exception("Your business bceid does not match that of the approved admin.")
        return True

    # check_users_admin_request_eligibility
    def is_user_eligible_to_request_admin_access(user_guid: UUID, operator_id: UUID):
        """
        Check if a user is eligible to request admin access to an operator.

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            operatorIid (uuid): The if of the operator to which admin access is being requested.

        Returns:
            True or raises an exception.
        """

        approved_admins = UserOperatorDataAccessService.get_approved_admin_users(operator_id)
        if approved_admins.filter(user_guid=user_guid).exists():
            raise Exception("You are already an admin for this Operator!")
        if len(approved_admins) > 0:
            raise Exception("This Operator already has an admin user!")

        # User already has a pending request for this operator
        # NOTE: This is a bit of a weird case, but it's possible for a user to have a pending request for an operator and if we show the UserOperator request form, they could submit another request and end up with two
        pending_admins = UserOperatorDataAccessService.get_pending_admin_users(operator_id)

        if pending_admins.filter(user_guid=user_guid).exists():
            raise Exception("You already have a pending request for this Operator!")

        return True

    def request_access(operator_id: UUID, user_guid: UUID):
        if ApplicationAccessService.does_user_belong_to_operator(operator_id, user_guid):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)

        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}

    # this function could just return boolean or throw exception or whatever, if we control flow with throwing errors we don't need to return anything probably better, success/fail/array of errors also an option

    def request_admin_access(operator_id: UUID, user_guid: UUID):
        if ApplicationAccessService.is_user_eligible_to_request_admin_access(user_guid, operator_id):
            # Making a draft UserOperator instance if one doesn't exist
            user_operator = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator_id)
        return {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}

    def get_allowed_user_operator(user_guid: UUID, user_operator_id: UUID):
        user = UserDataAccessService.get_user_by_guid(user_guid)
        user_operator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        # brianna not sure how this fits into service layer, method could be on data access instead of model
        if user.is_industry_user():
            # Industry users can only get their own UserOperator instance
            if user_operator.user.user_guid != user_guid:
                # brianna better message?
                raise Exception("Your user is not associated with this operator.")
            return UserOperatorOut.from_orm(user_operator)
