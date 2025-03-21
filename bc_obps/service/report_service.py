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
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService
from reporting.service.report_version_service import ReportVersionService
from django.forms.models import model_to_dict


class ReportService:
    @classmethod
    @transaction.atomic()
    def create_report(cls, operation_id: UUID, reporting_year: int) -> int:
        if ReportDataAccessService.report_exists(operation_id, reporting_year):
            raise Exception("A report already exists for this operation and year, unable to create a new one.")

        # Fetching report context
        operation = (
            Operation.objects.select_related("operator")
            .prefetch_related("activities", "regulated_products")
            .get(id=operation_id)
        )
        operator = operation.operator

        # Creating report object

        report = Report.objects.create(
            operation=operation,
            operator=operator,
            reporting_year=ReportingYearDataAccessService.get_by_year(reporting_year),
        )

        report_version = ReportVersionService.create_report_version(report)
        return report_version.id

    @classmethod
    def get_report_operation_by_version_id(cls, report_version_id: int) -> dict:
        report_operation = ReportOperation.objects.get(report_version__id=report_version_id)
        report_operation_representatives = ReportOperationRepresentative.objects.filter(
            report_version__id=report_version_id
        )
        report_version = ReportVersion.objects.get(id=report_version_id)

        report_operation_data = model_to_dict(report_operation)

        return {
            **report_operation_data,
            "report_operation_representatives": report_operation_representatives,
            "operation_representative_name": [
                rep.id for rep in report_operation_representatives if rep.selected_for_report
            ],
            "operation_report_type": report_version.report_type,
            "operation_report_status": report_version.status,
        }

    @classmethod
    @transaction.atomic
    def save_report_operation(cls, report_version_id: int, data: ReportOperationIn) -> ReportOperation:
        # Fetch the existing report operation
        report_operation = ReportOperation.objects.get(report_version__id=report_version_id)

        # Update the selected_for_report field based on the provided data
        representative_ids_in_data = data.operation_representative_name
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
        activities = Activity.objects.filter(id__in=data.activities)
        report_operation.activities.set(activities)
        regulated_products = RegulatedProduct.objects.filter(id__in=data.regulated_products)
        report_operation.regulated_products.set(regulated_products)
        report_operation.save()

        facility_reports: QuerySet[FacilityReport] = FacilityReport.objects.filter(report_version__id=report_version_id)
        if activities:
            for f in facility_reports:
                f.activities.set(activities)
                f.save()

        return report_operation

    @classmethod
    def get_regulated_products_by_version_id(cls, version_id: int) -> QuerySet[RegulatedProduct]:
        report_operation = ReportOperation.objects.get(report_version_id=version_id)

        regulated_products = report_operation.regulated_products.all()

        return regulated_products

    @staticmethod
    def get_report_type_by_version_id(version_id: int) -> ReportVersion:
        return ReportVersion.objects.get(id=version_id)

    @staticmethod
    def get_registration_purpose_by_version_id(version_id: int) -> dict:
        registration_purpose = ReportOperation.objects.get(report_version__id=version_id).registration_purpose
        return {"registration_purpose": registration_purpose}
