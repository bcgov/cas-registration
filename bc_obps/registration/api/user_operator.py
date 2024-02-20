from uuid import UUID
from django.db import transaction
from django.db import transaction
from registration.api.utils.handle_operator_addresses import handle_operator_addresses
from registration.api.utils.handle_parent_operators import handle_parent_operators
from registration.utils import (
    generate_useful_error,
    update_model_instance,
    check_users_admin_request_eligibility,
    check_access_request_matches_business_guid,
)
from django.core.exceptions import ValidationError
import pytz
from registration.decorators import authorize
from registration.schema import (
    UserOperatorOut,
    SelectOperatorIn,
    Message,
    UserOperatorPaginatedOut,
    UserOperatorOperatorIn,
    RequestAccessOut,
    IsApprovedUserOperator,
    UserOperatorIdOut,
    UserOperatorStatusUpdate,
    ExternalDashboardUsersTileData,
    PendingUserOperatorOut,
    OperatorFromUserOperatorOut,
)
from typing import List

from .api_base import router
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404

from registration.models import (
    AppRole,
    BusinessRole,
    Operator,
    User,
    UserOperator,
    Address,
)
from ninja.responses import codes_4xx
from datetime import datetime
from django.forms import model_to_dict
from registration.constants import PAGE_SIZE


# Function to save operator data to reuse in POST/PUT methods
def save_operator(payload: UserOperatorOperatorIn, operator_instance: Operator, user: User):
    # rollback the transaction if any of the following fails (mostly to prevent orphaned addresses)
    with transaction.atomic():

        physical_address, mailing_address = handle_operator_addresses(payload).values()
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
        ]
        created_or_updated_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, payload.dict()
        )
        created_or_updated_operator_instance.save()
        created_or_updated_operator_instance.set_create_or_update(user.pk)

        handle_parent_operators(payload.parent_operators_array, created_or_updated_operator_instance, user)

        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=created_or_updated_operator_instance
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 200, {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}


##### GET #####
@router.get(
    "/user-operator-from-user",
    response={200: PendingUserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator_from_user",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_from_user(request):
    try:
        user_operator = (
            UserOperator.objects.only("id", "status", "operator__id", "operator__is_new", "operator__status")
            .exclude(status=UserOperator.Statuses.DECLINED)
            .select_related("operator")
            .get(user_id=request.current_user.user_guid)
        )
    except UserOperator.DoesNotExist:
        return 404, {"message": "User is not associated with any operator"}
    return 200, PendingUserOperatorOut.from_orm(user_operator)


@router.get(
    "/is-approved-admin-user-operator/{user_guid}",
    response={200: IsApprovedUserOperator, codes_4xx: Message},
    url_name="is_approved_admin_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def is_approved_admin_user_operator(request, user_guid: str):
    approved_user_operator: bool = UserOperator.objects.filter(
        user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()

    return 200, {"approved": approved_user_operator}


@router.get(
    "/user-operator-operator",
    response={200: OperatorFromUserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_operator(request):
    user: User = request.current_user
    try:
        user_operator = (
            UserOperator.objects.only("operator__status", "operator__id")
            .exclude(status=UserOperator.Statuses.DECLINED)
            .select_related("operator")
            .get(user=user.user_guid)
        )
    except UserOperator.DoesNotExist:
        return 404, {"message": "User is not associated with any operator"}
    return 200, user_operator.operator


@router.get("/user-operator-id", response={200: UserOperatorIdOut, codes_4xx: Message}, url_name="get_user_operator_id")
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_id(request):
    user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
    return 200, {"user_operator_id": user_operator.id}


@router.get(
    "/select-operator/user-operator/{uuid:user_operator_id}",
    response={200: UserOperatorOut, codes_4xx: Message},
    url_name="get_user_operator",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_user_operator(request, user_operator_id: UUID):
    user: User = request.current_user
    if user.is_industry_user():
        # Industry users can only get their own UserOperator instance
        try:
            user_operator = UserOperator.objects.select_related('operator').get(
                id=user_operator_id, user=user.user_guid
            )
        except UserOperator.DoesNotExist:
            return 404, {"message": "No matching userOperator found"}
        return UserOperatorOut.from_orm(user_operator)
    else:
        try:
            user_operator = UserOperator.objects.select_related('operator').get(id=user_operator_id)
        except UserOperator.DoesNotExist:
            return 404, {"message": "No matching userOperator found"}
        return UserOperatorOut.from_orm(user_operator)


@router.get(
    "/operator-has-admin/{operator_id}",
    response={200: bool, codes_4xx: Message},
    url_name="get_user_operator_admin_exists",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_admin_exists(request, operator_id: UUID):
    has_admin = UserOperator.objects.filter(
        operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()
    return 200, has_admin


@router.get(
    "/operator-access-declined/{operator_id}",
    response={200: bool, codes_4xx: Message},
    url_name="operator_access_declined",
)
@authorize(['industry_user'], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_admin_exists(request, operator_id: UUID):
    user: User = request.current_user
    is_declined = UserOperator.objects.filter(
        operator_id=operator_id, user_id=user.user_guid, status=UserOperator.Statuses.DECLINED
    ).exists()
    return 200, is_declined


@router.get(
    "/user-operator-list-from-user",
    response=List[ExternalDashboardUsersTileData],
    url_name="get_user_operator_list_from_user",
)
@authorize(["industry_user"], ["admin"])
def get_user_operator_list_from_user(request):
    user: User = request.current_user
    operator = (
        UserOperator.objects.select_related("operator")
        .exclude(status=UserOperator.Statuses.DECLINED)
        .get(user=user.user_guid)
        .operator
    )
    user_operator_list = UserOperator.objects.select_related("user").filter(
        operator_id=operator, user__business_guid=user.business_guid
    )
    return user_operator_list


@router.get("/user-operator-initial-requests", response=UserOperatorPaginatedOut, url_name="list_user_operators")
@authorize(AppRole.get_authorized_irc_roles())
def list_user_operators(request, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"):
    sort_direction = "-" if sort_order == "desc" else ""

    user_fields = [
        "first_name",
        "last_name",
        "email",
    ]

    if sort_field in user_fields:
        sort_field = f"user__{sort_field}"
    if sort_field == "legal_name":
        sort_field = "operator__legal_name"

    qs = (
        UserOperator.objects.select_related("operator", "user")
        .only("id", "status", "user__last_name", "user__first_name", "user__email", "operator__legal_name")
        .order_by(f"{sort_direction}{sort_field}")
        .exclude(
            # exclude access requests to an operator that already has an approved admin
            operator_id__in=UserOperator.objects.filter(status=UserOperator.Statuses.APPROVED).values_list(
                "operator_id", flat=True
            ),
        )
    )
    paginator = Paginator(qs, PAGE_SIZE)
    user_operator_list = []

    for user_operator in paginator.page(page).object_list:
        user_operator_related_fields_dict = model_to_dict(
            user_operator,
            fields=[
                "id",
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
            }
        )
    return 200, UserOperatorPaginatedOut(
        data=user_operator_list,
        row_count=paginator.count,
    )


##### POST #####


@router.post(
    "/select-operator/request-admin-access",
    response={201: RequestAccessOut, codes_4xx: Message},
    url_name="request_admin_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def request_admin_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=payload.operator_id)

    try:
        with transaction.atomic():
            # check if user is eligible to request access
            status, message = check_users_admin_request_eligibility(user, operator)
            if status != 200:
                return status, message
        # Making a pending UserOperator instance if one doesn't exist
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 201, {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


@router.post(
    "/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message}, url_name="request_access"
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def request_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=payload.operator_id)
    try:
        with transaction.atomic():
            status, message = check_access_request_matches_business_guid(user.user_guid, operator)
            if status != 200:
                return status, message

            # Making a draft UserOperator instance if one doesn't exist
            user_operator, created = UserOperator.objects.get_or_create(
                user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.REPORTER
            )
            if created:
                user_operator.set_create_or_update(user.pk)
            return 201, {"user_operator_id": user_operator.id, "operator_id": user_operator.operator.id}
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


@router.post(
    "/user-operator/operator",
    response={200: RequestAccessOut, codes_4xx: Message},
    url_name="create_operator_and_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def create_operator_and_user_operator(request, payload: UserOperatorOperatorIn):
    try:
        with transaction.atomic():
            cra_business_number: str = payload.cra_business_number
            user: User = request.current_user
            existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
            # check if operator with this CRA Business Number already exists
            if existing_operator:
                return 400, {"message": "Operator with this CRA Business Number already exists."}
            operator_instance: Operator = Operator(
                cra_business_number=cra_business_number,
                bc_corporate_registry_number=payload.bc_corporate_registry_number,
                # treating business_structure as a foreign key
                business_structure=payload.business_structure,
                # This used to default to 'Draft' but now defaults to 'Pending' since we removed page 2 of the user operator form
                status=Operator.Statuses.PENDING,
            )
            # save operator data
            return save_operator(payload, operator_instance, user)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### PUT #####
@router.put(
    "/user-operator/operator/{uuid:user_operator_id}",
    response={200: RequestAccessOut, codes_4xx: Message},
    url_name="update_operator_and_user_operator",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def update_operator_and_user_operator(request, payload: UserOperatorOperatorIn, user_operator_id: UUID):
    user: User = request.current_user
    try:
        user_operator_instance: UserOperator = get_object_or_404(UserOperator, id=user_operator_id, user=user)
        operator_instance: Operator = user_operator_instance.operator
        if operator_instance.status == 'Draft':
            operator_instance.status = 'Pending'

        # save operator data
        return save_operator(payload, operator_instance, user)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


@router.put(
    "/select-operator/user-operator/update-status",
    response={200: UserOperatorOut, codes_4xx: Message},
    url_name="update_user_operator_status",
)
@authorize(AppRole.get_all_authorized_app_roles(), ["admin"])
def update_user_operator_status(request, payload: UserOperatorStatusUpdate):
    current_user: User = request.current_user  # irc user or industry user admin
    if payload.user_operator_id:  # to update the status of a user_operator by user_operator_id
        user_operator = get_object_or_404(UserOperator, id=payload.user_operator_id)
    else:
        return 404, {"message": "No parameters provided"}

    # We can't update the status of a user_operator if the operator has been declined or is awaiting review, or if the operator is new
    operator = get_object_or_404(Operator, id=user_operator.operator.id)
    if user_operator.operator.status == Operator.Statuses.DECLINED or operator.is_new:
        return 400, {"message": "Operator must be approved before approving users."}
    try:
        with transaction.atomic():
            user_operator.status = payload.status
            if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.DECLINED]:
                user_operator.verified_at = datetime.now(pytz.utc)
                user_operator.verified_by_id = current_user.user_guid

            elif user_operator.status == UserOperator.Statuses.PENDING:
                user_operator.verified_at = None
                user_operator.verified_by_id = None

            user_operator.save(update_fields=["status", "verified_at", "verified_by_id"])
            user_operator.set_create_or_update(current_user.pk)

            if user_operator.status == UserOperator.Statuses.DECLINED:
                # hard delete contacts (Senior Officers) associated with the operator and the user who requested access
                user_operator.operator.contacts.filter(
                    created_by=user_operator.user, business_role=BusinessRole.objects.get(role_name='Senior Officer')
                ).delete()
            return UserOperatorOut.from_orm(user_operator)
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### DELETE #####
