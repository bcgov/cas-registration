from registration.schema import OptedOutOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.opted_out_operation_detail import OptedOutOperationDetail
from registration.utils import update_model_instance


class OptedOutOperationDataAccessService:
    @classmethod
    def upsert_opted_out_operation_detail(
        cls,
        opted_in_operation_detail_id: int,
        opted_out_operation_detail_data: OptedOutOperationDetailIn,
    ) -> OptedOutOperationDetail:
        """
        Creates a new OptedOutOperationDetail instance or updates the existing instance for an OptedInOperationDetail record.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)

        # if there already exists an opted_out_operation_detail record for the opted-in operation,
        # update the existing record
        if opted_in_operation_detail.opted_out_operation:
            opted_out_operation_detail = update_model_instance(
                opted_in_operation_detail.opted_out_operation,
                opted_out_operation_detail_data.dict().keys(),
                opted_out_operation_detail_data.dict(),
            )
            opted_out_operation_detail.save()

        # otherwise an opted_out_operation_detail record doesn't exist, so create it
        # and associate it with the opted_in_operation_detail
        else:
            opted_out_operation_detail = OptedOutOperationDetail.objects.create(
                final_reporting_year_id=opted_out_operation_detail_data.final_reporting_year
            )
            opted_in_operation_detail.opted_out_operation = opted_out_operation_detail
            opted_in_operation_detail.save(update_fields=["opted_out_operation"])
        return opted_out_operation_detail

    @classmethod
    def delete_opted_out_operation_detail(cls, opted_out_operation_detail_id: int) -> None:
        """
        Deletes the specified OptedOutOperationDetail instance - this implies that the opted-out operation has opted back in.
        This method is idempotent (if no OptedOutOperationDetail record exists, no exception will be raised.)
        """
        try:
            opted_out_detail = OptedOutOperationDetail.objects.get(id=opted_out_operation_detail_id)
        except OptedOutOperationDetail.DoesNotExist:
            # idempotent delete - do nothing
            return

        # find the related OptedInOperationDetail record
        opted_in_detail_qs = OptedInOperationDetail.objects.filter(opted_out_operation=opted_out_detail)
        # detach the opted-out record from the opted-in record via FK
        opted_in_detail_qs.update(opted_out_operation=None)
        opted_out_detail.delete()
