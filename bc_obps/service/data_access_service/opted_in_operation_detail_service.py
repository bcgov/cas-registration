from typing import Optional
from uuid import UUID
from service.operation_service import OperationService
from registration.schema.v2.operation import OptedInOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.operation import Operation
from registration.utils import update_model_instance


class OptedInOperationDataAccessService:
    @classmethod
    def create_or_update_opted_in_operation_detail(
        cls,
        user_guid: UUID,
        opted_in_operation_detail_data: OptedInOperationDetailIn,
        opted_in_operation_detail_id: Optional[int],
    ) -> OptedInOperationDetail:
        if opted_in_operation_detail_id:
            # Fetch the existing instance if an ID has been provided
            opted_in_operation_detail_instance = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
            # Update the existing instance with the new data
            opted_in_operation_detail_instance = update_model_instance(
                opted_in_operation_detail_instance,
                opted_in_operation_detail_data.dict().keys(),
                opted_in_operation_detail_data.dict(),
            )
        else:
            # If no ID has been provided, create a new instance of OptedInOperationDetail and insert the provided data
            opted_in_operation_detail_instance = OptedInOperationDetail.objects.create(*opted_in_operation_detail_data)

        opted_in_operation_detail_instance.save()
        opted_in_operation_detail_instance.set_create_or_update(user_guid)
        return opted_in_operation_detail_instance

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
