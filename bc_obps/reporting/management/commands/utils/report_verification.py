from reporting.models.report_version import ReportVersion
from reporting.schema.report_verification import ReportVerificationIn
from reporting.service.report_verification_service import ReportVerificationService


def create_report_verification(report_version: ReportVersion):
    """
    Creates minimal verification data required for submission.
    """
    ReportVerificationService.save_report_verification(
        report_version.id,
        ReportVerificationIn(
            verification_conclusion='conclude',
        ),
    )
