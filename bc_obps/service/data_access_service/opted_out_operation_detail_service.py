from registration.schema import OptedOutOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.opted_out_operation_detail import OptedOutOperationDetail
from registration.utils import update_model_instance


class OptedOutOperationDataAccessService:
    @classmethod
    def create_opted_out_operation_detail(
        cls,
        opted_in_operation_detail_id: int,
        opted_out_operation_detail_data: OptedOutOperationDetailIn,
    ) -> OptedOutOperationDetail:
        """
        Creates a new OptedOutOperationDetail instance.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        opted_out_operation_detail = OptedOutOperationDetail.objects.create(
            effective_date=opted_out_operation_detail_data.effective_date
        )
        opted_in_operation_detail.opted_out_operation = opted_in_operation_detail
        opted_in_operation_detail.save()

        return opted_out_operation_detail

    @classmethod
    def update_opted_out_operation_detail(
        cls, opted_out_operation_detail_id: int, opted_out_operation_detail_data: OptedOutOperationDetailIn
    ) -> OptedOutOperationDetail:
        """
        Updates an existing OptedOutOperationDetail instance.
        """
        opted_out_operation_detail = OptedOutOperationDetail.objects.get(id=opted_out_operation_detail_id)
        updated_opted_out_operation_detail_instance = update_model_instance(
            opted_out_operation_detail,
            opted_out_operation_detail_data.dict().keys(),
            opted_out_operation_detail_data.dict(),
        )
        updated_opted_out_operation_detail_instance.save()
        return updated_opted_out_operation_detail_instance
