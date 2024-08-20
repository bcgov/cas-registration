from uuid import UUID
from ninja.types import DictStrAny
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.utils import update_model_instance


class OptedInOperationDataAccessService:
    @classmethod
    def update_opted_in_operation_detail(
        cls,
        user_guid: UUID,
        opted_in_operation_detail_id: int,
        opted_in_operation_detail_data: DictStrAny,
    ) -> OptedInOperationDetail:
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        updated_opted_in_operation_detail_instance = update_model_instance(
            opted_in_operation_detail,
            opted_in_operation_detail_data.keys(),
            opted_in_operation_detail_data,
        )
        updated_opted_in_operation_detail_instance.save()
        updated_opted_in_operation_detail_instance.set_create_or_update(user_guid)
        return updated_opted_in_operation_detail_instance
