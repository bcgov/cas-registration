from django.db import transaction
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

    @staticmethod
    @transaction.atomic
    def create_supplementary_report_version_version(report_version_id: int) -> ReportVersion:
        """
        Creates a new report version based on an existing report version, incrementing the version number.
        """
        report_version = ReportVersion.objects.get(id=report_version_id)

        # Check if the report status is "Submitted"
        if report_version.status != ReportVersion.ReportVersionStatus.Submitted:            
            raise Exception("report_version_not_submitted")
        
        # Create a new report version as a Draft
        new_report_version = ReportVersion.objects.create(
            report=report_version.report,
            report_type=report_version.report_type,
            status=ReportVersion.ReportVersionStatus.Draft,  # New version always starts as a draft
            is_latest_submitted=False,  # Cloned version should not be marked as latest submitted
        )

        # Clone ReportOperation
        old_report_operation = ReportOperation.objects.get(report_version=report_version)
        new_report_operation = ReportOperation.objects.create(
            operator_legal_name=old_report_operation.operator_legal_name,
            operator_trade_name=old_report_operation.operator_trade_name,
            operation_name=old_report_operation.operation_name,
            operation_type=old_report_operation.operation_type,
            operation_bcghgid=old_report_operation.operation_bcghgid,
            bc_obps_regulated_operation_id=old_report_operation.bc_obps_regulated_operation_id,
            report_version=new_report_version,
        )
        new_report_operation.activities.set(old_report_operation.activities.all())
        new_report_operation.regulated_products.set(old_report_operation.regulated_products.all())

        # Clone ReportOperationRepresentatives
        representatives = ReportOperationRepresentative.objects.filter(report_version=report_version)
        for rep in representatives:
            ReportOperationRepresentative.objects.create(
                report_version=new_report_version,
                representative_name=rep.representative_name,
                selected_for_report=rep.selected_for_report,
            )

        # Clone FacilityReport
        facility_reports = FacilityReport.objects.filter(report_version=report_version)
        for facility_report in facility_reports:
            new_facility_report = FacilityReport.objects.create(
                facility=facility_report.facility,
                facility_name=facility_report.facility_name,
                facility_type=facility_report.facility_type,
                facility_bcghgid=facility_report.facility_bcghgid,
                report_version=new_report_version,
                is_completed=False,
            )
            new_facility_report.activities.set(facility_report.activities.all())

        return new_report_version
