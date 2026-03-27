import logging
from typing import Optional, Protocol
from django.db import transaction
from compliance.models import ComplianceReport, ComplianceReportVersion
from compliance.service.supplementary_version_service.decreased_credit_handler import DecreasedCreditHandler
from compliance.service.supplementary_version_service.decreased_obligation_handler import DecreasedObligationHandler
from compliance.service.supplementary_version_service.increased_credit_handler import IncreasedCreditHandler
from compliance.service.supplementary_version_service.increased_obligation_handler import IncreasedObligationHandler
from compliance.service.supplementary_version_service.manual_handler import ManualHandler
from compliance.service.supplementary_version_service.new_earned_credits_handler import NewEarnedCreditsHandler
from compliance.service.supplementary_version_service.no_change_handler import NoChangeHandler
from compliance.service.supplementary_version_service.supercede_version_handler import SupercedeVersionHandler
from reporting.models import ReportComplianceSummary, ReportVersion
from service.error_service.handle_exception import ExceptionHandler

logger = logging.getLogger(__name__)


class SupplementaryScenarioHandler(Protocol):
    @staticmethod
    def can_handle(new_summary: ReportComplianceSummary, previous_summary: ReportComplianceSummary) -> bool: ...

    @staticmethod
    def handle(
        compliance_report: ComplianceReport,
        new_summary: ReportComplianceSummary,
        previous_summary: ReportComplianceSummary,
        version_count: int,
    ) -> Optional[ComplianceReportVersion]: ...


class SupplementaryVersionService:
    def __init__(self) -> None:
        self.handlers: list[SupplementaryScenarioHandler] = [
            IncreasedObligationHandler(),
            DecreasedObligationHandler(),
            NoChangeHandler(),
            IncreasedCreditHandler(),
            DecreasedCreditHandler(),
            NewEarnedCreditsHandler(),
        ]

    @transaction.atomic
    def handle_supplementary_version(
        self, compliance_report: ComplianceReport, report_version: ReportVersion, version_count: int
    ) -> Optional[ComplianceReportVersion]:

        # Get the previous version (lower ID = older)
        previous_version = (
            ReportVersion.objects.filter(report_id=report_version.report_id, id__lt=report_version.id)
            .order_by('-id')
            .first()
        )  # Get the most recent one that's older
        if not previous_version:
            logger.error(f"No previous version found for report version {report_version.id}")
            return None  # No previous version exists

        new_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=report_version.id)
        previous_version_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=previous_version.id)

        # If the previous version was handled manually, run the manual handler & exit
        if ManualHandler.can_handle(
            new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
        ):
            return ManualHandler.handle(
                compliance_report=compliance_report,
                new_summary=new_version_compliance_summary,
                previous_summary=previous_version_compliance_summary,
                version_count=version_count,
            )

        # If the previous version can be superceded, run the supercede handler & exit
        if SupercedeVersionHandler.can_handle(
            new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
        ):
            SupercedeVersionHandler.handle(
                compliance_report=compliance_report,
                new_summary=new_version_compliance_summary,
                previous_summary=previous_version_compliance_summary,
                version_count=version_count,
            )
            return None

        # Find the right handler and delegate
        for handler in self.handlers:
            if handler.can_handle(
                new_summary=new_version_compliance_summary, previous_summary=previous_version_compliance_summary
            ):
                return handler.handle(
                    compliance_report=compliance_report,
                    new_summary=new_version_compliance_summary,
                    previous_summary=previous_version_compliance_summary,
                    version_count=version_count,
                )
        logger.error(
            f"No handler found for report version {report_version.id} and compliance report {compliance_report.id}"
        )
        ExceptionHandler.capture_sentry_exception(
            Exception(
                f"No handler found for report version {report_version.id} and compliance report {compliance_report.id}"
            ),
            "no_handler_found",
        )
        return None
