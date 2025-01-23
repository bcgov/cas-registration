from typing import Dict, Optional
from uuid import UUID
from registration.emails import send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.schema.v1.contact import ContactIn
from registration.schema.v1.user_operator import UserOperatorStatusUpdate
from registration.schema.v2.operator import OperatorIn
from registration.utils import update_model_instance
from service.contact_service import ContactService
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator
from django.db import transaction
from registration.constants import UNAUTHORIZED_MESSAGE
from service.operator_service_v2 import OperatorServiceV2
from registration.schema.v2.user_operator import UserOperatorFilterSchema
from django.db.models import QuerySet
from django.db.models.functions import Lower
from ninja import Query
from registration.utils import set_verification_columns


class UserOperatorServiceV2:

    # Function to create operator instance
    @classmethod
    @transaction.atomic()
    def save_operator(cls, updated_data: OperatorIn, operator_instance: Operator, user_guid: UUID) -> Operator:
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
        created_operator_instance.set_create_or_update(user_guid)

        return created_operator_instance

    @classmethod
    @transaction.atomic()
    def create_operator_and_user_operator(cls, user_guid: UUID, payload: OperatorIn) -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator

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
            is_new=False,
        )
        operator: Operator = cls.save_operator(payload, operator_instance, user_guid)

        # create/save user operator instance as an approved admin
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.set_create_or_update(user_guid)
            user_operator.role = UserOperator.Roles.ADMIN
            user_operator.status = UserOperator.Statuses.APPROVED
            user_operator.save()

        # update the user operator operator with data in the request payload
        OperatorServiceV2.update_operator(user_guid, payload)

        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

    @classmethod
    def list_user_operators_v2(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: UserOperatorFilterSchema = Query(...),
    ) -> QuerySet[UserOperator]:

        user = UserDataAccessService.get_by_guid(user_guid)
        # This service is only available to IRC users
        if not user.is_irc_user():
            raise Exception(UNAUTHORIZED_MESSAGE)

        # Used to show internal users the list of user_operators to approve/deny
        base_qs = UserOperatorDataAccessService.get_admin_user_operator_requests_for_irc_users()

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
            set_verification_columns(user_operator, admin_user_guid)

            if user_operator.status == UserOperator.Statuses.DECLINED:
                # Set role to pending for now but we may want to add a new role for declined
                user_operator.role = UserOperator.Roles.PENDING

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
                # we only update the role if the user_operator is being approved
                user_operator.role = updated_role  # type: ignore[assignment]
                contact_payload = ContactIn(
                    first_name=user_operator.user.first_name,
                    last_name=user_operator.user.last_name,
                    email=user_operator.user.email,
                    phone_number=str(user_operator.user.phone_number),  # ContactIn expects a string,
                    position_title=user_operator.user.position_title,
                )
                contact = ContactService.create_contact(admin_user_guid, contact_payload)
                user_operator.operator.contacts.add(contact)

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
        user_operator.set_create_or_update(admin_user_guid)

        return user_operator
