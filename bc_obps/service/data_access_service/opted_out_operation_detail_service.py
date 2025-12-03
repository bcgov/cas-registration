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

        print(f"\n\n\n opted_in_operation {str(opted_in_operation_detail)}")
        print(str(opted_in_operation_detail.opted_out_operation))

        # if there already exists an opted_out_operation_detail record for the opted-in operation,
        # update the existing record
        if opted_in_operation_detail.opted_out_operation:
            print("updating")
            print(opted_out_operation_detail_data)
            print(opted_out_operation_detail_data.dict().keys())
            print(opted_out_operation_detail_data.dict())
            opted_out_operation_detail = update_model_instance(
                opted_in_operation_detail.opted_out_operation,
                opted_out_operation_detail_data.dict().keys(),
                opted_out_operation_detail_data.dict()
            )
            opted_out_operation_detail.save()

        # otherwise an opted_out_operation_detail record doesn't exist, so create it
        # and associate it with the opted_in_operation_detail
        else:
            print("\n\n\n\nCREATING")
            opted_out_operation_detail = OptedOutOperationDetail.objects.create(
                final_reporting_year=opted_out_operation_detail_data.final_reporting_year
            )
            opted_in_operation_detail.opted_out_operation = opted_out_operation_detail
            opted_in_operation_detail.save(update_fields=["opted_out_operation"])
        return opted_out_operation_detail
    