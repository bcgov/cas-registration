from decimal import Decimal
from model_bakery.baker import make_recipe
from compliance.models import (
    ComplianceChargeRate,
    ComplianceEarnedCredit,
    ComplianceObligation,
    CompliancePeriod,
    ComplianceReport,
    ComplianceReportVersion,
)
from compliance.signals.consumers import handle_report_submission
from registration.models import Operation
from reporting.models import ReportVersion, ReportingYear


HANDLE_OBLIGATION_INTEGRATION = (
    "compliance.service.elicensing.elicensing_obligation_service"
    ".ElicensingObligationService.handle_obligation_integration"
)
SEND_OBLIGATION_EMAIL = "compliance.tasks.retryable_send_notice_of_obligation_email"
SEND_EARNED_CREDITS_EMAIL = "compliance.service.earned_credits_service.retryable_send_notice_of_earned_credits_email"
SEND_NO_OBLIGATION_EMAIL = (
    "compliance.service.compliance_report_version_service"
    ".retryable_send_notice_of_no_obligation_no_earned_credits_email"
)


class ComplianceIntegrationTestBase:
    """
    Shared infrastructure for compliance integration tests.

    Subclasses set REPORTING_YEAR and override _create_base_infrastructure
    if they need extra setup (e.g. ElicensingInterestRate for penalty tests).
    """

    REPORTING_YEAR = 2024

    # ------------------------------------------------------------------
    # Infrastructure
    # ------------------------------------------------------------------

    def _create_base_infrastructure(self):
        self.reporting_year = ReportingYear.objects.get(pk=self.REPORTING_YEAR)
        self.compliance_period = CompliancePeriod.objects.get(reporting_year=self.reporting_year)
        self.charge_rate = ComplianceChargeRate.objects.get(reporting_year=self.reporting_year).rate

        self.operation = make_recipe(
            "registration.tests.utils.operation",
            bc_obps_regulated_operation=make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )
        self.report = make_recipe(
            "reporting.tests.utils.report",
            operator=self.operation.operator,
            operation=self.operation,
            reporting_year=self.reporting_year,
        )

    # ------------------------------------------------------------------
    # Fake / mock implementations
    # ------------------------------------------------------------------

    @staticmethod
    def fake_handle_obligation_pre_invoice(obligation_id, _compliance_period):
        """Mock for handle_obligation_integration when invoice date has NOT been reached."""
        obligation = ComplianceObligation.objects.get(id=obligation_id)
        obligation.compliance_report_version.status = (
            ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        obligation.compliance_report_version.save(update_fields=["status"])

    # ------------------------------------------------------------------
    # Initial report helpers
    # ------------------------------------------------------------------

    def _fire_initial_report(self, excess_emissions, credited_emissions):
        """Create a ReportVersion + ReportComplianceSummary and fire the signal."""
        self.initial_report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
        )
        make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            report_version=self.initial_report_version,
            excess_emissions=excess_emissions,
            credited_emissions=credited_emissions,
        )

        handle_report_submission(
            sender=self.__class__,
            version_id=self.initial_report_version.id,
        )

        self.compliance_report = ComplianceReport.objects.get(report=self.report)
        self.initial_crv = ComplianceReportVersion.objects.get(
            compliance_report=self.compliance_report,
            is_supplementary=False,
        )

    def _create_initial_report_with_obligation_pre_invoice(self, excess_emissions):
        """Fire signal for initial report -> obligation without invoice.

        After: self.initial_crv has the status OBLIGATION_PENDING_INVOICE_CREATION.
        """
        self._fire_initial_report(excess_emissions, Decimal("0"))
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        initial_obligation = ComplianceObligation.objects.get(compliance_report_version=self.initial_crv)
        assert initial_obligation.elicensing_invoice is None

    def _create_initial_report_with_earned_credits(self, credited_emissions):
        """Fire signal for initial report -> earned credits.

        After: self.initial_crv has status EARNED_CREDITS,
               self.initial_earned_credit has status CREDITS_NOT_ISSUED.
        """
        self._fire_initial_report(Decimal("0"), credited_emissions)
        assert self.initial_crv.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        self.initial_earned_credit = ComplianceEarnedCredit.objects.get(compliance_report_version=self.initial_crv)
        assert self.initial_earned_credit.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED

    # ------------------------------------------------------------------
    # Supplementary report helper
    # ------------------------------------------------------------------

    def _submit_supplementary_report(
        self, excess_emissions, credited_emissions=Decimal("0"), previous_report_version=None
    ):
        """Mark the previous version as submitted, create supplementary report data, fire signal.

        Args:
            excess_emissions: Excess emissions for the supplementary.
            credited_emissions: Credited emissions for the supplementary (default 0).
            previous_report_version: The report version to mark as submitted.
                                     Defaults to self.initial_report_version.

        Returns:
            The newly created supplementary ReportVersion.
        """
        prev_rv = previous_report_version or self.initial_report_version
        prev_rv.status = ReportVersion.ReportVersionStatus.Submitted
        prev_rv.save(update_fields=["status"])

        supplementary_report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
        )
        make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            report_version=supplementary_report_version,
            excess_emissions=excess_emissions,
            credited_emissions=credited_emissions,
        )

        handle_report_submission(
            sender=self.__class__,
            version_id=supplementary_report_version.id,
        )
        return supplementary_report_version
