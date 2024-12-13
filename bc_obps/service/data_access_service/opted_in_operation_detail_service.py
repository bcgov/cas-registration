from uuid import UUID
from service.operation_service import OperationService
from registration.schema.v2.operation import OptedInOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.operation import Operation
from registration.utils import update_model_instance


class OptedInOperationDataAccessService:
    @classmethod
    def update_opted_in_operation_detail(
        cls,
        user_guid: UUID,
        opted_in_operation_detail_id: int,
        opted_in_operation_detail_data: OptedInOperationDetailIn,
    ) -> OptedInOperationDetail:
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        updated_opted_in_operation_detail_instance = update_model_instance(
            opted_in_operation_detail,
            opted_in_operation_detail_data.dict().keys(),
            opted_in_operation_detail_data.dict(),
        )
        updated_opted_in_operation_detail_instance.save()
        updated_opted_in_operation_detail_instance.set_create_or_update(user_guid)
        return updated_opted_in_operation_detail_instance

    @classmethod
    def archive_or_delete_opted_in_operation_detail(cls, user_guid: UUID, operation_id: UUID) -> None:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        if operation.opted_in_operation:
            opted_in_operation_detail_id = operation.opted_in_operation.id
            opted_in_operation_detail = OptedInOperationDetail.objects.get(pk=opted_in_operation_detail_id)
            if operation.status == Operation.Statuses.REGISTERED:
                opted_in_operation_detail.set_archive(user_guid)
            else:
                opted_in_operation_detail.delete()
