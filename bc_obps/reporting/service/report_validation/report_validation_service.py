from typing import List
from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_verification import ReportVerification
from reporting.service.report_verification_service import ReportVerificationService


class ReportValidationResult:
    """
    Data type for validator return type.

    - valid: whether the validation passed
    - errors: dictionary
    """

    valid: bool
    errors: dict[str, str]


class ReportValidationService:
    """
    A service to validate reports before submission

    Strategy: independent, plug-in validators will
    """

    @staticmethod
    def validate_report(version_id: int, validators: List[str] = None) -> None:
        """
        Future implementation could create a specific exception housing all the issues a report would have
        Django-ninja could then have a special way of parsing that error with a custom error code.

        Validates that the report meets necessary requirements before submission:
        - If report verification is required, ensures that a `ReportVerification` entry exists.
        - If a verification statement is required, ensures the presence of a corresponding attachment.
        """
        try:
            # Check if verification is mandatory
            isVerificationMandatory = (
                ReportVerificationService.get_report_needs_verification(version_id)
            )

            if isVerificationMandatory:
                # Check for the ReportVerification entry
                try:
                    ReportVerification.objects.get(
                        report_version_id=version_id
                    )  # attempt to get the object.
                except ObjectDoesNotExist:
                    raise Exception("missing_report_verification")

                # Check for the attachment only if mandatory
                ReportAttachment.objects.get(
                    report_version_id=version_id,
                    attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
                )
        except ReportAttachment.DoesNotExist:
            raise Exception("verification_statement")
