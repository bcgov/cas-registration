from uuid import UUID
from ninja.types import DictStrAny
from registration.models.new_entrant_operation_detail import NewEntrantOperationDetail
from registration.utils import update_model_instance


class NewEntrantOperationDataAccessService:
    @classmethod
    def update_new_entrant_operation_detail(
        cls,
        user_guid: UUID,
        new_entrant_operation_detail_id: int,
        new_entrant_operation_detail_data: DictStrAny,
    ) -> NewEntrantOperationDetail:
        new_entrant_operation_detail = NewEntrantOperationDetail.objects.get(id=new_entrant_operation_detail_id)
        updated_new_entrant_operation_detail_instance = update_model_instance(
            new_entrant_operation_detail,
            new_entrant_operation_detail_data.keys(),
            new_entrant_operation_detail_data,
        )
        updated_new_entrant_operation_detail_instance.save()
        updated_new_entrant_operation_detail_instance.set_create_or_update(user_guid)
        return updated_new_entrant_operation_detail_instance
