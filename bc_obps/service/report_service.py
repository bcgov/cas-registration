import uuid
from reporting.models.report import Report
from service.data_access_service.facility_service import FacilityDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from django.db import transaction


class ReportService:

    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: uuid.uuid4, reporting_year: int):
        operation = OperationDataAccessService.get_by_id(operation_id)
        facilities = FacilityDataAccessService.get_currently_owned(operation)

        report = Report.objects.create(
            title="Test Report",
            description="Test description",
            operation=operation,
            reporting_year=reporting_year,
        )
