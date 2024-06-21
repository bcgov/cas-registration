import uuid
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.models.report_facility import ReportFacility
from reporting.models.report_operation import ReportOperation
from service.data_access_service.facility_service import FacilityDataAccessService
from django.db import transaction


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: uuid.uuid4, reporting_year: int):
        operation = Operation.objects.select_related('reporting_activities', 'regulated_products', 'operator').get(
            id=operation_id
        )
        operator = operation.operator
        facilities = FacilityDataAccessService.get_currently_owned(operation)

        report_operation = ReportOperation.objects.create(
            operator_legal_name=operator.legal_name,
            operator_trade_name=operator.trade_name,
            operation_name=operation.name,
            operation_type=operation.type,
            operation_bcghgid=operation.bcghg_id,
            bc_obps_regulated_operation_id=operation.bc_obps_regulated_operation.id,
            operation_representative_name=operation.point_of_contact.get_full_name(),
        )
        report_operation.activities.add(operation.reporting_activities)

        for f in facilities:
            report_facility = ReportFacility.objects.create(
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id,
            )
            report_facility.activities.add(operation.reporting_activities)
            report_facility.products.add(operation.regulated_products)

        report = Report.objects.create(
            operation=operation,
            reporting_year=reporting_year,
            report_operation=report_operation,
        )
        report.report_facilities.add()
