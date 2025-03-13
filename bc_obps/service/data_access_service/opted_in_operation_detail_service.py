from registration.schema import OptedInOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.utils import update_model_instance


class OptedInOperationDataAccessService:
    @classmethod
    def update_opted_in_operation_detail(
        cls,
        opted_in_operation_detail_id: int,
        opted_in_operation_detail_data: OptedInOperationDetailIn,
    ) -> OptedInOperationDetail:
        """
        Updates an existing OptedInOperationDetail instance.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        updated_opted_in_operation_detail_instance = update_model_instance(
            opted_in_operation_detail,
            opted_in_operation_detail_data.dict().keys(),
            opted_in_operation_detail_data.dict(),
        )
        updated_opted_in_operation_detail_instance.save()
        return updated_opted_in_operation_detail_instance