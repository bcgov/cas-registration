from registration.schema import (
    UserOperatorPaginatedOut,
)
from typing import List
from django.core.paginator import Paginator

from registration.models import (
    Operation,
    User,
    UserOperator,
)
from django.forms import model_to_dict
from registration.constants import PAGE_SIZE
from registration.decorators import handle_http_errors

class ListUserOperatorsService:
    @staticmethod 
    @handle_http_errors() 
    def list_user_operators(request, page: int = 1, sort_field: str = "created_at", sort_order: str = "desc"):
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
                status=Operation.Statuses.PENDING,
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
        user_operator_list = []

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
                }
            )
        return 200, UserOperatorPaginatedOut(
            data=user_operator_list,
            row_count=paginator.count,
        )
