from typing import Dict, Optional, List
from uuid import UUID
from registration.emails import send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.utils import update_model_instance
from service.addresses_service import AddressesService
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.schema.v1.user_operator import (
    UserOperatorOperatorIn,
    UserOperatorPaginatedOut,
    UserOperatorStatusUpdate,
    UserOperatorListOut,
)
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.models import Operator, User, UserOperator, BusinessRole
from django.db import transaction
from zoneinfo import ZoneInfo
from datetime import datetime
from django.core.paginator import Paginator
from django.forms import model_to_dict
from registration.constants import PAGE_SIZE, UNAUTHORIZED_MESSAGE


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

    # Function to create/update an operator when creating/updating a user_operator
    @classmethod
    @transaction.atomic()
    def save_operator(
        cls, updated_data: UserOperatorOperatorIn, operator_instance: Operator, user_guid: UUID
    ) -> Operator:
        existing_physical_address = getattr(getattr(operator_instance, 'physical_address', None), 'id', None)
        existing_mailing_address = getattr(getattr(operator_instance, 'mailing_address', None), 'id', None)

        physical_address, mailing_address = AddressesService.upsert_addresses_from_data(
            updated_data.dict(), existing_physical_address, existing_mailing_address
        ).values()

        operator_instance.physical_address = physical_address
        operator_instance.mailing_address = mailing_address

        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "physical_address",
            "mailing_address",
            "website",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
        ]
        created_or_updated_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, updated_data.dict()
        )
        created_or_updated_operator_instance.save(update_fields=operator_related_fields + ["status"])
        created_or_updated_operator_instance.set_create_or_update(user_guid)

        # Using the import here to avoid circular import
        from service.operator_service import OperatorService

        OperatorService.handle_parent_operators(
            updated_data.parent_operators_array, created_or_updated_operator_instance, user_guid
        )
        return created_or_updated_operator_instance

    @classmethod
    # Used to show cas_admin the list of user_operators to approve/deny
    def list_user_operators(
        cls, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"
    ) -> UserOperatorPaginatedOut:
        sort_direction = "-" if sort_order == "desc" else ""

        user_fields = ["first_name", "last_name", "email", "bceid_business_name"]

        if sort_field in user_fields:
            sort_field = f"user__{sort_field}"
        if sort_field == "legal_name":
            sort_field = "operator__legal_name"

        qs = (
            UserOperator.objects.select_related("operator", "user")
            .only(
                "id",
                "status",
                "user__last_name",
                "user__first_name",
                "user__email",
                "user__bceid_business_name",
                "operator__legal_name",
            )
            .order_by(f"{sort_direction}{sort_field}")
            .exclude(
                # exclude pending user_operators that belong to operators that already have approved admins
                status=UserOperator.Statuses.PENDING,
                operator_id__in=UserOperator.objects.filter(
                    role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
                ).values_list("operator_id", flat=True),
            )
            .exclude(
                # exclude approved user_operators that were approved by industry users
                id__in=UserOperator.objects.filter(
                    status=UserOperator.Statuses.APPROVED, verified_by__in=User.objects.filter(app_role='industry_user')
                ).values_list("id", flat=True)
            )
        )

        paginator = Paginator(qs, PAGE_SIZE)
        user_operator_list: List[UserOperatorListOut] = []

        for user_operator in paginator.page(page).object_list:
            user_operator_related_fields_dict = model_to_dict(
                user_operator,
                fields=[
                    "id",
                    "user_friendly_id",
                    "status",
                ],
            )
            user = user_operator.user
            user_related_fields_dict = model_to_dict(
                user,
                fields=user_fields,
            )
            operator = user_operator.operator
            operator_related_fields_dict = model_to_dict(
                operator,
                fields=[
                    "legal_name",
                ],
            )

            user_operator_list.append(
                {
                    **user_operator_related_fields_dict,
                    **user_related_fields_dict,
                    **operator_related_fields_dict,
                }  # type: ignore[arg-type] # we know this is a list of dictionaries with the correct keys
            )
        return UserOperatorPaginatedOut(
            data=user_operator_list,
            row_count=paginator.count,
        )

    @classmethod
    @transaction.atomic()
    def create_operator_and_user_operator(cls, new_data: UserOperatorOperatorIn, user_guid: UUID) -> Dict[str, UUID]:
        """
        Function to create a user_operator and an operator (new operator that doesn't exist yet).

        Parameters:
            new_data: Updated data for the user operator.
            user_guid: GUID of the user.

        Returns:
            dict: A dictionary containing the IDs of the created user_operator and operator.
                - 'user_operator_id' (UUID): ID of the user_operator.
                - 'operator_id' (UUID): ID of the operator.

        Raises:
            Exception: If an operator with the same CRA Business Number already exists.
        """
        cra_business_number: int = new_data.cra_business_number
        existing_operator: bool = Operator.objects.filter(cra_business_number=cra_business_number).exists()
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            # i don't think we actually need to do this brianna, django will handle?
            raise Exception("Operator with this CRA Business Number already exists.")
        operator_instance: Operator = Operator(
            cra_business_number=cra_business_number,
            bc_corporate_registry_number=new_data.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=new_data.business_structure,  # type: ignore[misc] # we use field validator which returns a BusinessStructure object
            # This used to default to 'Draft' but now defaults to 'Pending' since we removed page 2 of the user operator form
            status=Operator.Statuses.PENDING,
        )
        # save operator data
        operator: Operator = UserOperatorService.save_operator(new_data, operator_instance, user_guid)
        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperatorDataAccessService.get_or_create_user_operator(user_guid, operator.id)
        if created:
            user_operator.set_create_or_update(user_guid)
            # Send email to the external user to confirm the creation of the operator and the request for access
            send_operator_access_request_email(
                AccessRequestStates.CONFIRMATION,
                AccessRequestTypes.NEW_OPERATOR_AND_ADMIN,
                operator.legal_name,
                user_operator.user.get_full_name(),
                user_operator.user.email,
            )
        return {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}

    @classmethod
    @transaction.atomic()
    def update_status(
        cls, user_operator_id: UUID, updated_data: UserOperatorStatusUpdate, admin_user_guid: UUID
    ) -> UserOperator:
        "Function to update only the user_operator status (operator is already in the system and therefore doesn't need to be approved/denied)"
        admin_user: User = UserDataAccessService.get_by_guid(admin_user_guid)
        user_operator: UserOperator = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        operator: Operator = user_operator.operator
        # industry users can only update the status of user_operators from the same operator as themselves
        if admin_user.is_industry_user():
            # operator_business_guid can be None if no admins are approved yet (business_guids come from admin users)
            try:
                operator_business_guid = OperatorDataAccessService.get_operators_business_guid(operator.id)
            except Exception:
                operator_business_guid = None
            if operator_business_guid != admin_user.business_guid:
                raise PermissionError("Your user is not associated with this operator.")

        # We can't update the status of a user_operator if the operator has been declined or is awaiting review, or if the operator is new
        if operator.status == Operator.Statuses.DECLINED or operator.is_new:
            raise Exception("Operator must be approved before approving or declining users.")

        user_operator.status = updated_data.status  # type: ignore[attr-defined]
        updated_role = updated_data.role

        if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
            user_operator.verified_at = datetime.now(ZoneInfo("UTC"))
            user_operator.verified_by_id = admin_user_guid

            if user_operator.status == UserOperator.Statuses.APPROVED and updated_role != UserOperator.Roles.PENDING:
                # we only update the role if the user_operator is being approved
                user_operator.role = updated_role  # type: ignore[assignment]

            access_request_type: AccessRequestTypes = AccessRequestTypes.OPERATOR_WITH_ADMIN
            if admin_user.is_irc_user():
                if user_operator.status == UserOperator.Statuses.DECLINED:
                    access_request_type = AccessRequestTypes.ADMIN
                else:
                    # use the email template for new operator and admin approval if the creator of the operator is the same as the user who requested access
                    # Otherwise, use the email template for admin approval
                    access_request_type = (
                        AccessRequestTypes.NEW_OPERATOR_AND_ADMIN
                        if operator.created_by == user_operator.user
                        else AccessRequestTypes.ADMIN
                    )
            # Send email to user if their request was approved or declined (using the appropriate email template)
            send_operator_access_request_email(
                AccessRequestStates(user_operator.status),
                # If the admin user is an IRC user, the access request type is admin,
                # otherwise the admin user is an external user and the access request is for an operator with existing admin
                access_request_type,
                operator.legal_name,
                user_operator.user.get_full_name(),
                user_operator.user.email,
            )

        elif user_operator.status == UserOperator.Statuses.PENDING:
            user_operator.verified_at = None
            user_operator.verified_by_id = None
            user_operator.role = UserOperator.Roles.PENDING

        user_operator.save(update_fields=["status", "verified_at", "verified_by_id", "role"])
        user_operator.set_create_or_update(admin_user_guid)
        if user_operator.status == UserOperator.Statuses.DECLINED:
            # Set role to pending for now but we may want to add a new role for declined
            user_operator.role = UserOperator.Roles.PENDING
            # hard delete contacts (Senior Officers) associated with the operator and the user who requested access
            user_operator.operator.contacts.filter(
                created_by=user_operator.user,
                business_role=BusinessRole.objects.get(role_name='Senior Officer'),
            ).delete()
        return user_operator

    @classmethod
    @transaction.atomic()
    def update_operator_and_user_operator(
        cls, user_operator_id: UUID, updated_data: UserOperatorOperatorIn, user_guid: UUID
    ) -> Dict[str, UUID]:
        "Function to update both the operator and user_operator"
        user_operator_instance = UserOperatorDataAccessService.get_user_operator_by_id(user_operator_id)
        operator_instance: Operator = user_operator_instance.operator
        # Check cra_business_number for uniqueness except for the current operator
        cra_business_number: int = updated_data.cra_business_number
        existing_operator: bool = (
            Operator.objects.filter(cra_business_number=cra_business_number).exclude(id=operator_instance.id).exists()
        )
        # check if operator with this CRA Business Number already exists
        if existing_operator:
            raise Exception("Operator with this CRA Business Number already exists.")
        if operator_instance.status == 'Draft':
            operator_instance.status = 'Pending'
        # save operator data
        operator: Operator = UserOperatorService.save_operator(updated_data, operator_instance, user_guid)
        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperator.objects.get_or_create(user_id=user_guid, operator=operator)
        if created:
            user_operator.set_create_or_update(user_guid)
        return {"user_operator_id": user_operator.id, 'operator_id': operator.id}

    @classmethod
    def get_current_user_approved_user_operator_or_raise(cls, user: User) -> UserOperator:
        user_operator = UserOperatorDataAccessService.get_approved_user_operator(user)
        if not user_operator:
            raise Exception(UNAUTHORIZED_MESSAGE)
        return user_operator
