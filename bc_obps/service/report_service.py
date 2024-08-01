from uuid import UUID
from registration.models.operation import Operation
from reporting.models.report import Report
from registration.models import ReportingActivity, RegulatedProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from service.data_access_service.facility_service import FacilityDataAccessService
from django.db import transaction
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService
from reporting.schema.report_operation import ReportOperationIn


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> Report:

        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and year, unable to create a new one.")

        # Fetching report context

        operation = (
            Operation.objects.select_related('operator')
            .prefetch_related('reporting_activities', 'regulated_products')
            .get(id=operation_id)
        )

        operator = operation.operator
        facilities = FacilityDataAccessService.get_current_facilities_by_operation(operation)

        # Creating report object

        report = Report.objects.create(
            operation=operation,
            operator=operator,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
        )

        # Creating first version

        report_version = ReportVersion.objects.create(report=report)

        # Pre-populating data to the first version

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
            report_version=report_version,
        )
        report_operation.reporting_activities.add(*list(operation.reporting_activities.all()))
        report_operation.regulated_products.add(*list(operation.regulated_products.all()))

        for f in facilities:
            facility_report = FacilityReport.objects.create(
                facility=f,
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id,
                report_version=report_version,
            )
            facility_report.activities.add(*list(operation.reporting_activities.all()))
            facility_report.products.add(*list(operation.regulated_products.all()))

        return report

    @classmethod
    def get_report_operation_by_version_id(cls, report_version_id: int) -> ReportOperation:
        return ReportOperation.objects.get(report_version__id=report_version_id)

    @classmethod
    def save_report_operation(cls, report_version_id: int, data: ReportOperationIn) -> ReportOperation:
        report_operation = ReportOperation.objects.get(report_version__id=report_version_id)

        # Updating fields from data
        report_operation.operator_legal_name = data.operator_legal_name
        report_operation.operator_trade_name = data.operator_trade_name
        report_operation.operation_name = data.operation_name
        report_operation.operation_type = data.operation_type
        report_operation.operation_bcghgid = data.operation_bcghgid
        report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id
        report_operation.operation_representative_name = data.operation_representative_name

        # Fetch and set ManyToMany fields
        reporting_activities = ReportingActivity.objects.filter(name__in=data.reporting_activities)
        regulated_products = RegulatedProduct.objects.filter(name__in=data.regulated_products)

        # Set ManyToMany relationships
        report_operation.reporting_activities.set(reporting_activities)
        report_operation.regulated_products.set(regulated_products)

        # Save the updated report operation
        report_operation.save()

        return report_operation
