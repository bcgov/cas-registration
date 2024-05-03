from registration.schema.operation import OperationListOut
from service.user_operator_service import UserOperatorService
from registration.models import Operation
from registration.schema import (
    OperationOut,
)


class OperationDataAccessService:
    @classmethod
    def get_by_id(cls, operation_id):
        return Operation.objects.select_related('operator', 'bc_obps_regulated_operation').get(id=operation_id)

    @classmethod
    def get_by_id_for_operation_out_schema(cls, operation_id):
        return (
            Operation.objects.only(
                *OperationOut.Config.model_fields,
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
            )
            .select_related(
                "operator__physical_address", "operator__mailing_address", "point_of_contact__address", "naics_code"
            )
            .prefetch_related("operator__parent_operators", "regulated_products")
            .get(id=operation_id)
        )

    @classmethod
    def get_by_id_for_update(cls, operation_id):
        return (
            Operation.objects.only('operator__id', 'point_of_contact__id')
            .select_related('operator', 'point_of_contact')
            .prefetch_related('regulated_products')
            .get(id=operation_id)
        )

    @classmethod
    def create_operation(cls, user_guid, operation_data, regulated_products):

        operation = Operation.objects.create(
            **operation_data,
            created_by_id=user_guid,
        )
        operation.regulated_products.set(regulated_products)
        return operation

    @classmethod
    def get_all_operations_for_irc_user(cls):
        # IRC users can see all operations except ones with status of "Not Started" or "Draft"
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .exclude(status=Operation.Statuses.NOT_STARTED)
            .exclude(status=Operation.Statuses.DRAFT)
            .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
        )

    @classmethod
    def get_all_operations_for_industry_user(cls, user):
        user_operator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        # order by created_at to get the latest one first
        return (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .filter(operator_id=user_operator.operator_id)
            .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
        )
