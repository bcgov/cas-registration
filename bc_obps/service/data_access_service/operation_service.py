from typing import Iterable, Union
from uuid import UUID
from registration.schema import OperationListOut
from registration.models import Operation, RegulatedProduct, User
from django.db.models import QuerySet
from ninja.types import DictStrAny

from service.user_operator_service import UserOperatorService


class OperationDataAccessService:
    @classmethod
    def get_by_id(cls, operation_id: UUID) -> Operation:
        return Operation.objects.select_related('operator', 'bc_obps_regulated_operation').get(id=operation_id)

    @classmethod
    def get_by_id_for_operation_out_schema(cls, operation_id: UUID) -> Operation:
        return (
            Operation.objects.only(
                "id",
                "name",
                "type",
                "opt_in",
                "regulated_products",
                "status"
                "naics_code",
                "point_of_contact__address",
                "point_of_contact__first_name",
                "point_of_contact__last_name",
                "point_of_contact__email",
                "point_of_contact__position_title",
                "point_of_contact__phone_number",
                "bc_obps_regulated_operation__id",
                "operator__physical_address",
                "operator__mailing_address",
                "operator__legal_name",
                "operator__trade_name",
                "operator__cra_business_number",
                "operator__bc_corporate_registry_number",
                "operator__business_structure",
                "operator__website",
                "opted_in_operation",
            )
            .select_related(
                "operator__physical_address",
                "operator__mailing_address",
                "point_of_contact__address",
                "naics_code",
                "opted_in_operation",
            )
            .prefetch_related("operator__parent_operators", "regulated_products")
            .get(id=operation_id)
        )

    @classmethod
    def get_by_id_for_update(cls, operation_id: UUID) -> Operation:
        return (
            Operation.objects.only('operator__id', 'point_of_contact__id')
            .select_related('operator', 'point_of_contact')
            .prefetch_related('regulated_products')
            .get(id=operation_id)
        )

    @classmethod
    def create_operation(
        cls,
        user_guid: UUID,
        operation_data: DictStrAny,
        regulated_products: Union[QuerySet[RegulatedProduct], Iterable[RegulatedProduct]],
    ) -> Operation:
        operation = Operation.objects.create(
            **operation_data,
            created_by_id=user_guid,
        )
        operation.regulated_products.set(regulated_products)

        return operation

    @classmethod
    def get_all_operations_for_user(cls, user: User) -> QuerySet[Operation]:
        if user.is_irc_user():
            # IRC users can see all operations except ones with status of "Not Started" or "Draft"
            return (
                Operation.objects.select_related("operator", "bc_obps_regulated_operation")
                .exclude(status=Operation.Statuses.NOT_STARTED)
                .exclude(status=Operation.Statuses.DRAFT)
                .only(*OperationListOut.Meta.fields, "operator__legal_name", "bc_obps_regulated_operation__id")
            )
        else:
            # Industry users can only see operations associated with their own operator
            user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(operator_id=user_operator.operator_id)
            .only(*OperationListOut.Meta.fields, "operator__legal_name", "bc_obps_regulated_operation__id")
        )
