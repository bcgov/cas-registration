from common.lib.dataclasses import asdict
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.utils import update_model_instance
from service.data_types.operation_service_data_types import OptedInOperationDetailData


class OptedInOperationDataAccessService:
    @classmethod
    def update_opted_in_operation_detail(
        cls,
        opted_in_operation_detail_id: int,
        opted_in_operation_detail_data: OptedInOperationDetailData,
    ) -> OptedInOperationDetail:
        """
        Updates an existing OptedInOperationDetail instance.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        update_dict = asdict(opted_in_operation_detail_data)

        updated_opted_in_operation_detail_instance = update_model_instance(
            opted_in_operation_detail,
            update_dict.keys(),
            update_dict,
        )
        updated_opted_in_operation_detail_instance.save()
        return updated_opted_in_operation_detail_instance

    @classmethod
    def update_opted_in_final_reporting_year(
        cls, opted_in_operation_detail_id: int, final_reporting_year: int | None
    ) -> OptedInOperationDetail:
        """
        Updates the final reporting year of an OptedInOperationDetail instance (for opted-in operations that are opting out).
        If final_reporting_year is None, clears the field.
        """
        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        opted_in_operation_detail.final_reporting_year_id = final_reporting_year
        opted_in_operation_detail.save()
        return opted_in_operation_detail
