from django.db import transaction
from reporting.models.facility_report import FacilityReport
from reporting.models.report import Report
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from service.data_access_service.facility_service import FacilityDataAccessService
from reporting.models import ReportOperationRepresentative


class ReportVersionService:
    @staticmethod
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
