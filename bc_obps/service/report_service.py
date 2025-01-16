from uuid import UUID
from django.db import transaction
from django.db.models import QuerySet
from django.db.models import Case, When, Value, BooleanField
from registration.models import Activity, RegulatedProduct
from registration.models.operation import Operation
from reporting.models import ReportOperationRepresentative
from reporting.models.report import Report
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.schema.report_operation import ReportOperationIn
from service.data_access_service.facility_service import FacilityDataAccessService
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> int:

        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and year, unable to create a new one.")

        # Fetching report context

        operation = (
            Operation.objects.select_related('operator')
            .prefetch_related('activities', 'regulated_products')
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
            operation_bcghgid=operation.bcghg_id.id if operation.bcghg_id else None,
            bc_obps_regulated_operation_id=(
                operation.bc_obps_regulated_operation.id if operation.bc_obps_regulated_operation else ""
            ),
            report_version=report_version,
        )

        for contact in operation.contacts.all():
            ReportOperationRepresentative.objects.create(
                report_version=report_version,
                representative_name=contact.get_full_name(),
                selected_for_report=False,
            )
        report_operation.activities.add(*list(operation.activities.all()))
        report_operation.regulated_products.add(*list(operation.regulated_products.all()))

        for f in facilities:
            facility_report = FacilityReport.objects.create(
                facility=f,
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id.id if f.bcghg_id else None,
                report_version=report_version,
            )
            facility_report.activities.add(*list(operation.activities.all()))

        return report_version.id

    @classmethod
    def get_report_operation_by_version_id(cls, report_version_id: int) -> ReportOperation:
        return ReportOperation.objects.get(report_version__id=report_version_id)

    @classmethod
    @transaction.atomic
    def save_report_operation(cls, report_version_id: int, data: ReportOperationIn) -> ReportOperation:
        # Fetch the existing report operation
        report_operation = ReportOperation.objects.get(report_version__id=report_version_id)

        # Update the selected_for_report field based on the provided data
        representative_ids_in_data = data.operation_representative_name  # List of IDs from input
        ReportOperationRepresentative.objects.filter(report_version_id=report_version_id).update(
            selected_for_report=Case(
                When(id__in=representative_ids_in_data, then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            )
        )
        # Update fields from data
        report_operation.operator_legal_name = data.operator_legal_name
        report_operation.operator_trade_name = data.operator_trade_name
        report_operation.operation_name = data.operation_name
        report_operation.operation_type = data.operation_type
        report_operation.operation_bcghgid = data.operation_bcghgid
        report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id

        # Fetch and set ManyToMany fields
        activities = Activity.objects.filter(name__in=data.activities)
        report_operation.activities.set(activities)
        report_operation.save()

        facility_reports: QuerySet[FacilityReport] = FacilityReport.objects.filter(report_version__id=report_version_id)
        if activities.exists():
            for f in facility_reports:
                f.activities.set(activities)
                f.save()

        ReportVersion.objects.filter(id=report_version_id).update(report_type=data.operation_report_type)
        return report_operation

    @classmethod
    def get_regulated_products_by_version_id(cls, version_id: int) -> QuerySet[RegulatedProduct]:
        report_operation = ReportOperation.objects.get(report_version_id=version_id)

        regulated_products = report_operation.regulated_products.all()

        return regulated_products

    @staticmethod
    def get_report_type_by_version_id(version_id: int) -> ReportVersion:
        return ReportVersion.objects.get(id=version_id)
