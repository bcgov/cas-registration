from typing import Dict, Literal, Optional
from uuid import UUID
from registration.emails import send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.schema import OperatorIn, UserOperatorFilterSchema, UserOperatorStatusUpdate
from registration.utils import update_model_instance
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator, Contact, BusinessRole
from django.db import transaction
from registration.constants import UNAUTHORIZED_MESSAGE
from service.operator_service import OperatorService
from django.db.models import QuerySet
from django.db.models.functions import Lower
from ninja import Query
from datetime import datetime
from zoneinfo import ZoneInfo


class UserOperatorService:
    @classmethod
    def check_if_user_eligible_to_access_user_operator(cls, user_guid: UUID, user_operator_id: UUID) -> Optional[bool]:
        """
        Check if a user is eligible to access a user_operator (i.e., they're allowed to access their own information (user_operator, operations, etc.) but not other people's).

        Args:
            user_guid (uuid): The user for whom eligibility is being checked.
            user_operator_id (uuid): The id of the user_operator to which access is being requested.

        Returns:
            True or raises an exception.
        """

        user: User = UserDataAccessService.get_by_guid(user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        if user.is_industry_user() and user_operator.user.user_guid != user_guid:
            raise PermissionError("Your user is not associated with this operator.")
        # internal users are always allowed to access user operators. (Though the authorize function prevents them from accessing certain external-only endpoints)
        return None

    @classmethod
    def get_current_user_approved_user_operator_or_raise(cls, user: User) -> UserOperator:
        user_operator = UserOperatorDataAccessService.get_approved_user_operator(user)
        if not user_operator:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return user_operator

    # Function to create operator instance
    @classmethod
    @transaction.atomic()
    def save_operator(cls, updated_data: OperatorIn, operator_instance: Operator) -> Operator:
        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
        ]
        created_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, updated_data.dict()
        )
        created_operator_instance.save(update_fields=operator_related_fields + ["status"])

        return created_operator_instance

    @classmethod
    @transaction.atomic()
    def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn) -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator
        We also need to create a contact for the user_operator once operator is created

        Parameters:
            payload: Request payload from Operator form POST
            user_guid: GUID of the user.

        Returns:
            dict: A dictionary containing the IDs of the created user_operator and operator.
                - 'user_operator_id' (UUID): ID of the user_operator.
                - 'operator_id' (UUID): ID of the operator.

        """

        # create/save operator instance as approved
        operator_instance: Operator = Operator(
            cra_business_number=payload.cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=payload.business_structure,  # type: ignore[misc] # we use field validator which returns a BusinessStructure object
            # set as approved
            status=Operator.Statuses.APPROVED,
        )
        operator: Operator = cls.save_operator(payload, operator_instance)

        # create/save user operator instance as an approved admin
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.role = UserOperator.Roles.ADMIN
            user_operator.status = UserOperator.Statuses.APPROVED
            user_operator.save()

        # update the user-operator operator with data in the request payload
        OperatorService.update_operator(user_guid, payload)

        # Create a contact record for the user_operator and add it to the operator's contacts
        # Using get_or_create to avoid creating duplicate contacts(if any)
        Contact.objects.get_or_create(
            first_name=user_operator.user.first_name,
            last_name=user_operator.user.last_name,
            email=user_operator.user.email,
            phone_number=str(user_operator.user.phone_number),
            position_title=user_operator.user.position_title,
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
            operator_id=operator.id,
        )

        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

    @classmethod
    def list_user_operators(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[Literal["desc", "asc"]],
        filters: UserOperatorFilterSchema = Query(...),
    ) -> QuerySet[UserOperator]:
        user = UserDataAccessService.get_by_guid(user_guid)
        # This service is only available to IRC users
        if not user.is_irc_user():
            raise Exception(UNAUTHORIZED_MESSAGE)

        # Used to show internal users the list of user_operators to approve/deny
        base_qs = UserOperatorDataAccessService.get_user_operator_requests_for_irc_users()

        # `created_at` and `user_friendly_id` are not case-insensitive fields and Lower() cannot be applied to them
        if sort_field in ['created_at', 'user_friendly_id']:
            sort_direction = "-" if sort_order == "desc" else ""
            return filters.filter(base_qs).order_by(f"{sort_direction}{sort_field}")

        # Use Lower for case-insensitive ordering
        lower_sort_field = Lower(sort_field)
        if sort_order == "desc":
            # Apply descending order
            return filters.filter(base_qs).order_by(lower_sort_field.desc())
        # Apply ascending order
        return filters.filter(base_qs).order_by(lower_sort_field)

    @classmethod
    @transaction.atomic()
    def update_status_and_create_contact(
        cls, user_operator_id: UUID, payload: UserOperatorStatusUpdate, admin_user_guid: UUID
    ) -> UserOperator:
        """Function to update the user_operator status. If they are being approved, we create a Contact record for them."""
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)

        # industry users can only update the status of user_operators from the same operator as themselves
        if admin_user.is_industry_user():
            # operator_business_guid can be None if no admins are approved yet (business_guids come from admin users)
            try:
                operator_business_guid = OperatorDataAccessService.get_operators_business_guid(
                    user_operator.operator.id
                )
            except Exception:
                operator_business_guid = None
            if operator_business_guid != admin_user.business_guid:
                raise PermissionError("Your user is not associated with this operator.")

        user_operator.status = payload.status  # type: ignore[attr-defined]
        updated_role = payload.role

        if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
            user_operator.verified_at = datetime.now(ZoneInfo("UTC"))
            user_operator.verified_by_id = admin_user_guid

            if user_operator.status == UserOperator.Statuses.DECLINED:
                # Set role to pending for now but we may want to add a new role for declined
                user_operator.role = UserOperator.Roles.PENDING

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
                # we only update the role if the user_operator is being approved
                user_operator.role = updated_role  # type: ignore[assignment]
                # Create a contact record for the user_operator and add it to the operator's contacts
                # Using get_or_create to avoid creating duplicate contacts
                Contact.objects.get_or_create(
                    first_name=user_operator.user.first_name,
                    last_name=user_operator.user.last_name,
                    email=user_operator.user.email,
                    phone_number=str(user_operator.user.phone_number),
                    position_title=user_operator.user.position_title,
                    business_role=BusinessRole.objects.get(role_name="Operation Representative"),
                    operator_id=user_operator.operator_id,
                )
            access_request_type: AccessRequestTypes = AccessRequestTypes.OPERATOR_WITH_ADMIN

            if admin_user.is_irc_user():
                if user_operator.status == UserOperator.Statuses.DECLINED:
                    access_request_type = AccessRequestTypes.ADMIN
                else:
                    # use the email template for new operator and admin approval if the creator of the operator is the same as the user who requested access
                    # Otherwise, use the email template for admin approval
                    access_request_type = (
                        AccessRequestTypes.NEW_OPERATOR_AND_ADMIN
                        if user_operator.operator.created_by == user_operator.user
                        else AccessRequestTypes.ADMIN
                    )
            # Send email to user if their request was approved or declined (using the appropriate email template)
            send_operator_access_request_email(
                AccessRequestStates(user_operator.status),
                # If the admin user is an IRC user, the access request type is admin,
                # otherwise the admin user is an external user and the access request is for an operator with existing admin
                access_request_type,
                user_operator.operator.legal_name,
                user_operator.user.get_full_name(),
                user_operator.user.email,
            )

        elif user_operator.status == UserOperator.Statuses.PENDING:
            user_operator.verified_at = None
            user_operator.verified_by_id = None
            user_operator.role = UserOperator.Roles.PENDING
        user_operator.save(update_fields=["status", "verified_at", "verified_by_id", "role"])

        return user_operator

    @classmethod
    def delete_user_operator(cls, user_guid: UUID, user_operator_id: UUID) -> None:
        cls.check_if_user_eligible_to_access_user_operator(user_guid, user_operator_id)
        UserOperator.objects.filter(id=user_operator_id).delete()
        return None
