from registration.schema import OptedInOperationDetailIn, OptedOutOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.utils import update_model_instance
from service.data_access_service.reporting_year import ReportingYearDataAccessService


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

    @classmethod
    def update_opted_in_final_reporting_year(
        cls, opted_in_operation_detail_id: int, payload: OptedOutOperationDetailIn
    ) -> OptedInOperationDetail:
        """
        Updates the final reporting year of an OptedInOperationDetail instance (for opted-in operations that are opting out).
        """

        opted_in_operation_detail = OptedInOperationDetail.objects.get(id=opted_in_operation_detail_id)
        reporting_year = ReportingYearDataAccessService.get_by_year(payload.final_reporting_year)
        opted_in_operation_detail.final_reporting_year = reporting_year
        opted_in_operation_detail.save()
        return opted_in_operation_detail
