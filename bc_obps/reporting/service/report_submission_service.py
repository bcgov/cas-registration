import json
from uuid import UUID
from django.core.exceptions import ValidationError
from reporting.service.report_sign_off_service import ReportSignOffData, ReportSignOffService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import ReportValidationError
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from reporting.signals.signals import report_submitted
from common.lib import pgtrigger
from django.db import transaction
from reporting.service.compliance_service import ComplianceService


class ReportSubmissionService:
    """
    A service to submit reports and handle the errors
    """

    @staticmethod
    @transaction.atomic()
    def submit_report(version_id: int, user_guid: UUID, sign_off_data: ReportSignOffData) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=version_id)

        validation_result = ReportValidationService.validate_report_version(version_id)

        is_regulated_operation = report_version.report.operation.is_regulated_operation

        if validation_result:
            ReportSubmissionService.raise_validation_errors(validation_result)

        ReportSignOffService.save_report_sign_off(version_id, sign_off_data)
        # Mark the previous latest submitted version as not latest
        with pgtrigger.ignore("reporting.ReportVersion:set_updated_audit_columns"):
            ReportVersion.objects.filter(
                report=report_version.report,
                status=ReportVersion.ReportVersionStatus.Submitted,
                is_latest_submitted=True,
            ).update(is_latest_submitted=False)

        # Save the compliance data for regulated operations (unregulated operations do not have compliance data)
        if is_regulated_operation:
            ComplianceService.save_compliance_data(version_id)

        # Set the new version as lastest submitted
        report_version.is_latest_submitted = True
        report_version.status = ReportVersion.ReportVersionStatus.Submitted
        report_version.save()

        # Send a signal that the report has been submitted
        report_submitted.send(sender=ReportSubmissionService, version_id=version_id, user_guid=user_guid)

        return report_version

    @staticmethod
    def raise_validation_errors(validation_result: dict[str, ReportValidationError]) -> None:
        """
        Raise a ValidationError with a JSON-encoded payload so that
        the fix_url property of ReportValidationError survives the exception-handler pipeline.
        generate_useful_error returns __all__ values unaltered, which lets the
        frontend parse all the errors and their fix URLs.
        """

        errors = []
        for key, val in validation_result.items():
            error_data: dict = {"key": key, "message": val.message}
            if val.fix_url:
                error_data["fix_url"] = val.fix_url
            errors.append(error_data)

        error_payload: dict = {"errors": errors}
        raise ValidationError({"__all__": json.dumps(error_payload)})
