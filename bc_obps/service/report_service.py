from uuid import UUID
from django.db.models import Case, When, Value, BooleanField
from django.db import transaction
from django.db.models import QuerySet
from registration.models import Activity
from registration.models import RegulatedProduct
from registration.models.operation import Operation
from reporting.models import ReportOperationRepresentative
from reporting.models.report import Report
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from service.data_access_service.report_service import ReportDataAccessService
from service.data_access_service.reporting_year import ReportingYearDataAccessService
from service.report_version_service import ReportVersionService
from django.forms.models import model_to_dict
from service.facility_report_service import FacilityReportService, SaveFacilityReportData
from typing import Any, List, Optional


class SaveReportOperationData:
    def __init__(
        self,
        operator_legal_name: str,
        operation_name: str,
        operation_type: str,
        registration_purpose: str,
        bc_obps_regulated_operation_id: str,
        activities: List[int],
        regulated_products: List[int],
        operation_report_type: str,
        operation_representative_name: List[int],
        operator_trade_name: Optional[str] = None,
        operation_bcghgid: Optional[str] = None,
    ):
        self.operator_legal_name = operator_legal_name
        self.operation_name = operation_name
        self.operation_type = operation_type
        self.registration_purpose = registration_purpose
        self.bc_obps_regulated_operation_id = bc_obps_regulated_operation_id
        self.activities = activities
        self.regulated_products = regulated_products
        self.operation_report_type = operation_report_type
        self.operation_representative_name = operation_representative_name
        self.operator_trade_name = operator_trade_name
        self.operation_bcghgid = operation_bcghgid


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
    @transaction.atomic()
    def delete_report_version(cls, report_version_id: int) -> bool:
        """
        Deletes report version with the given report_version_id if status is DRAFT
        Returns True if deletion is successful, False otherwise.
        """
        deleted, _ = ReportVersion.objects.filter(
            id=report_version_id,
            status=ReportVersion.ReportVersionStatus.Draft
        ).delete()
        return deleted > 0

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
            "operation_id": report_operation.report_version.report.operation.id,
        }

    @classmethod
    @transaction.atomic
    def save_report_operation(cls, report_version_id: int, data: Any) -> ReportOperation:
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

        if report_operation.operation_type == 'Linear Facilities Operation':
            facility_reports: QuerySet[FacilityReport] = FacilityReport.objects.filter(
                report_version__id=report_version_id
            )
            for f in facility_reports:
                FacilityReportService.set_activities_for_facility_report(facility_report=f, activities=data.activities)
        else:
            facility_report: FacilityReport = FacilityReport.objects.get(report_version__id=report_version_id)
            facility_report_save_data = SaveFacilityReportData(
                facility_name=report_operation.operation_name,
                facility_type=facility_report.facility_type,
                activities=data.activities,
            )
            FacilityReportService.save_facility_report(
                report_version_id=facility_report.report_version_id,
                facility_id=facility_report.facility_id,
                data=facility_report_save_data,
            )

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

    @classmethod
    @transaction.atomic()
    def update_report_operation(cls, version_id: int) -> dict:
        report_operation = ReportOperation.objects.get(report_version__id=version_id)
        operation = report_operation.report_version.report.operation
        operator = report_operation.report_version.report.operator
        report_operation.operation_name = operation.name
        report_operation.operation_type = operation.type
        report_operation.operation_bcghgid = operation.bcghg_id.id if operation.bcghg_id else None
        report_operation.bc_obps_regulated_operation_id = (
            operation.bc_obps_regulated_operation.id if operation.bc_obps_regulated_operation else ""
        )
        report_operation.registration_purpose = operation.registration_purpose if operation.registration_purpose else ""
        report_operation.operator_legal_name = operator.legal_name
        report_operation.operator_trade_name = operator.trade_name

        existing_representatives = ReportOperationRepresentative.objects.filter(report_version__id=version_id)
        existing_names = {rep.representative_name for rep in existing_representatives}
        contact_names = {contact.get_full_name() for contact in operation.contacts.all()}

        new_representatives = [
            ReportOperationRepresentative(
                report_version=report_operation.report_version,
                representative_name=contact.get_full_name(),
                selected_for_report=True,
            )
            for contact in operation.contacts.all()
            if contact.get_full_name() not in existing_names
        ]
        ReportOperationRepresentative.objects.bulk_create(new_representatives)

        # Remove outdated representatives
        existing_representatives.filter(representative_name__in=(existing_names - contact_names)).delete()

        report_operation.save()
        return cls.get_report_operation_by_version_id(version_id)
