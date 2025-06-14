from django.db import transaction

from django.forms import model_to_dict

from registration.models.operation import Operation
from reporting.models import ReportOperationRepresentative, ReportVersion
from reporting.models.report_operation import ReportOperation
from service.activity_service import ActivityService
from service.data_access_service.regulated_product_service import RegulatedProductDataAccessService
from service.facility_report_service import FacilityReportService

from service.reporting_year_service import ReportingYearService


class ReportOperationService:
    @classmethod
    def get_report_operation_data_by_version_id(cls, version_id: int) -> dict:
        report_operation = cls.get_report_operation_by_version_id(version_id)
        all_activities = ActivityService.get_all_activities()
        regulated_products = RegulatedProductDataAccessService.get_regulated_products()
        reporting_year = ReportingYearService.get_current_reporting_year()
        purpose = report_operation["registration_purpose"]
        facility_id = FacilityReportService.get_facility_report_by_version_id(version_id)

        return {
            "report_operation": report_operation,
            "facility_id": facility_id,
            "all_activities": all_activities,
            "all_regulated_products": regulated_products,
            "all_representatives": report_operation.get("report_operation_representatives", []),
            "report_type": report_operation.get("operation_report_type"),
            "show_regulated_products": purpose
            not in [
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                Operation.Purposes.REPORTING_OPERATION,
                Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
            ],
            "show_boro_id": purpose
            not in [
                Operation.Purposes.REPORTING_OPERATION,
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            ],
            "show_activities": purpose
            not in [
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
            ],
            "reporting_year": reporting_year.reporting_year,
        }

    @classmethod
    @transaction.atomic()
    def update_report_operation(cls, version_id: int) -> dict:
        report_operation = ReportOperation.objects.get(report_version__id=version_id)
        operation = report_operation.report_version.report.operation
        operator = report_operation.report_version.report.operator
        report_operation.operation_name = operation.name
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
                report_operation=report_operation,
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
        return cls.get_report_operation_data_by_version_id(version_id)

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
