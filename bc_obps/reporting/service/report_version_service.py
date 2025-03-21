from django.db import transaction
from django.db.models import QuerySet
from django.db.models import Case, When, Value, BooleanField
from django.forms.models import model_to_dict
from registration.models import Activity, RegulatedProduct
from reporting.models import ReportOperationRepresentative
from reporting.models.report import Report
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.schema.report_operation import ReportOperationIn
from reporting.service.report_version_service import ReportVersionService
from reporting.models.facility_report import FacilityReport
from reporting.models.report import Report
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from service.data_access_service.facility_service import FacilityDataAccessService
from reporting.models import ReportOperationRepresentative


class ReportVersionService:
    @staticmethod
    @transaction.atomic
    def create_report_version(
        report: Report,
        report_type: str = "Annual Report",
    ) -> ReportVersion:
        # Creating first version
        report_version = ReportVersion.objects.create(report=report, report_type=report_type)
        # Pre-populating data to the first version
        operation = report.operation
        operator = report.operator

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
            registration_purpose=operation.registration_purpose or 'OBPS Regulated Operation',
        )

        for contact in operation.contacts.all():
            ReportOperationRepresentative.objects.create(
                report_version=report_version,
                representative_name=contact.get_full_name(),
                selected_for_report=True,
            )
        report_operation.activities.add(*list(operation.activities.all()))
        report_operation.regulated_products.add(*list(operation.regulated_products.all()))

        facilities = FacilityDataAccessService.get_current_facilities_by_operation(operation)

        for f in facilities:
            facility_report = FacilityReport.objects.create(
                facility=f,
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id.id if f.bcghg_id else None,
                report_version=report_version,
                is_completed=False,
            )
            facility_report.activities.add(*list(operation.activities.all()))

        return report_version

    @staticmethod
    def delete_report_version(report_version_id: int) -> None:
        report_version = ReportVersion.objects.get(id=report_version_id)
        report_version.delete()

    @staticmethod
    @transaction.atomic
    def change_report_version_type(report_version_id: int, new_report_type: str) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=report_version_id)
        if report_version.report_type == new_report_type:
            return report_version

        ReportVersionService.delete_report_version(report_version.id)
        new_report_version = ReportVersionService.create_report_version(report_version.report, new_report_type)

        return new_report_version    

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

