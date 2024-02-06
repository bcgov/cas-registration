from urllib.error import HTTPError
from django.db import IntegrityError, transaction
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
    ParentOperator,
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
        # create physical address record
        physical_address = Address.objects.create(
            street_address=payload.physical_street_address,
            municipality=payload.physical_municipality,
            province=payload.physical_province,
            postal_code=payload.physical_postal_code,
        )
        operator_instance.physical_address = physical_address

        if payload.mailing_address_same_as_physical:
            mailing_address = physical_address
        else:
            # create mailing address record if mailing address is not the same as the physical address
            mailing_address = Address.objects.create(
                street_address=payload.mailing_street_address,
                municipality=payload.mailing_municipality,
                province=payload.mailing_province,
                postal_code=payload.mailing_postal_code,
            )
        operator_instance.mailing_address = mailing_address

        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "physical_address_id",
            "mailing_address_id",
            "website",
            "business_structure",
        ]
        created_or_updated_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, payload.dict()
        )
        created_or_updated_operator_instance.save()
        created_or_updated_operator_instance.set_create_or_update(user.pk)

        # create parent operator records
        operator_has_parent_operators: bool = payload.operator_has_parent_operators
        if operator_has_parent_operators:
            po_operator_fields_mapping = {
                "po_legal_name": "legal_name",
                "po_trade_name": "trade_name",
                "po_cra_business_number": "cra_business_number",
                "po_bc_corporate_registry_number": "bc_corporate_registry_number",
                "po_website": "website",
            }
            for idx, po_operator in enumerate(payload.parent_operators_array):
                new_po_operator_instance: ParentOperator = ParentOperator(
                    child_operator=created_or_updated_operator_instance,
                    operator_index=idx + 1,
                )
                # handle addresses--if there's no mailing address given, it's the same as the physical address
                po_physical_address = Address.objects.create(
                    street_address=po_operator.po_physical_street_address,
                    municipality=po_operator.po_physical_municipality,
                    province=po_operator.po_physical_province,
                    postal_code=po_operator.po_physical_postal_code,
                )
                new_po_operator_instance.physical_address = po_physical_address

                if po_operator.po_mailing_address_same_as_physical:
                    new_po_operator_instance.mailing_address = po_physical_address
                else:
                    po_mailing_address = Address.objects.create(
                        street_address=po_operator.po_mailing_street_address,
                        municipality=po_operator.po_mailing_municipality,
                        province=po_operator.po_mailing_province,
                        postal_code=po_operator.po_mailing_postal_code,
                    )
                    new_po_operator_instance.mailing_address = po_mailing_address

                new_po_operator_instance.business_structure = po_operator.po_business_structure
                new_po_operator_instance = update_model_instance(
                    new_po_operator_instance, po_operator_fields_mapping, po_operator.dict()
                )
                new_po_operator_instance.save()
                new_po_operator_instance.set_create_or_update(user.pk)

        # get an existing user_operator instance or create a new one with the default role
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=created_or_updated_operator_instance
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return 200, {"user_operator_id": user_operator.id, 'operator_id': user_operator.operator.id}


##### GET #####
@router.get("/user-operator-from-user", response={200: PendingUserOperatorOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_status(request):
    user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
    operator = get_object_or_404(Operator, id=user_operator.operator_id)
    return 200, {**user_operator.__dict__, "is_new": operator.is_new}


@router.get("/is-approved-admin-user-operator/{user_guid}", response={200: IsApprovedUserOperator, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def is_approved_admin_user_operator(request, user_guid: str):
    approved_user_operator: bool = UserOperator.objects.filter(
        user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()

    return 200, {"approved": approved_user_operator}


@router.get("/user-operator-operator", response={200: OperatorFromUserOperatorOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_operator_id(request):
    user: User = request.current_user
    try:
        user_operator = (
            UserOperator.objects.only("operator__status", "operator__id")
            .select_related("operator")
            .get(user=user.user_guid)
        )
    except UserOperator.DoesNotExist:
        return 404, {"message": "User is not associated with any operator"}
    except UserOperator.MultipleObjectsReturned:
        return 400, {"message": "User is associated with multiple operators"}
    return 200, user_operator.operator


@router.get("/user-operator-id", response={200: UserOperatorIdOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_id(request):
    user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
    return 200, {"user_operator_id": user_operator.id}


@router.get(
    "/select-operator/user-operator/{int:user_operator_id}", response={200: UserOperatorOut, codes_4xx: Message}
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_user_operator(request, user_operator_id: int):
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


@router.get("/operator-has-admin/{operator_id}", response={200: bool, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_user_operator_admin_exists(request, operator_id: int):
    has_admin = UserOperator.objects.filter(
        operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()
    return 200, has_admin


@router.get("/user-operator-list-from-user", response=List[ExternalDashboardUsersTileData])
@authorize(["industry_user"], ["admin"])
def get_user(request):
    user: User = request.current_user
    operator = UserOperator.objects.get(user=user.user_guid).operator
    user_operator_list = UserOperator.objects.filter(operator_id=operator)
    return user_operator_list


@router.get("/user-operators", response=UserOperatorPaginatedOut)
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
        
    qs = UserOperator.objects.select_related("operator", "user").only(
        "id", "status", "user__last_name", "user__first_name", "user__email", "operator__legal_name"
    ).order_by(f"{sort_direction}{sort_field}")
    paginator = Paginator(qs, PAGE_SIZE)
    user_operator_list = []

    paginator = Paginator(qs, 20)

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


@router.post("/select-operator/request-admin-access", response={201: RequestAccessOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def request_access(request, payload: SelectOperatorIn):
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


@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
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


@router.post("/user-operator/operator", response={200: RequestAccessOut, codes_4xx: Message})
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
            )
            # save operator data
            return save_operator(payload, operator_instance, user)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### PUT #####
@router.put("/user-operator/operator/{int:user_operator_id}", response={200: RequestAccessOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def update_operator_and_user_operator(request, payload: UserOperatorOperatorIn, user_operator_id: int):
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


@router.put("/select-operator/user-operator/update-status", response={200: UserOperatorOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), ["admin"])
def update_user_operator_status(request, payload: UserOperatorStatusUpdate):
    current_user: User = request.current_user  # irc user or industry user admin
    if payload.user_guid:  # to update the status of a user_operator by user_guid
        user_operator = get_object_or_404(UserOperator, user_id=payload.user_guid)
    elif payload.user_operator_id:  # to update the status of a user_operator by user_operator_id
        user_operator = get_object_or_404(UserOperator, id=payload.user_operator_id)
    else:
        return 404, {"message": "No parameters provided"}

    # We can't update the status of a user_operator if the operator has been declined or is awaiting review
    if user_operator.operator.status in [Operator.Statuses.PENDING, Operator.Statuses.DECLINED]:
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
