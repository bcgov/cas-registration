from uuid import UUID
from registration.models.operation import Operation
from reporting.models.report import Report
from reporting.models.report_facility import ReportFacility
from reporting.models.report_operation import ReportOperation
from service.data_access_service.facility_service import FacilityDataAccessService
from django.db import transaction
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> Report:

        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and year, unable to create a new one.")

        operation = (
            Operation.objects.select_related('operator')
            .prefetch_related('reporting_activities', 'regulated_products')
            .get(id=operation_id)
        )

        operator = operation.operator
        facilities = FacilityDataAccessService.get_current_facilities_by_operation(operation)

        report_operation = ReportOperation.objects.create(
            operator_legal_name=operator.legal_name,
            operator_trade_name=operator.trade_name,
            operation_name=operation.name,
            operation_type=operation.type,
            operation_bcghgid=operation.bcghg_id,
            bc_obps_regulated_operation_id=(
                operation.bc_obps_regulated_operation.id if operation.bc_obps_regulated_operation else ""
            ),
            operation_representative_name=(
                operation.point_of_contact.get_full_name() if operation.point_of_contact else ""
            ),
        )
        report_operation.activities.add(*list(operation.reporting_activities.all()))

        report = Report.objects.create(
            operation=operation,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
            report_operation=report_operation,
        )

        for f in facilities:
            report_facility = ReportFacility.objects.create(
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id,
                report=report,
            )
            report_facility.activities.add(*list(operation.reporting_activities.all()))
            report_facility.products.add(*list(operation.regulated_products.all()))

            report.report_facilities.add(report_facility)

        return report
