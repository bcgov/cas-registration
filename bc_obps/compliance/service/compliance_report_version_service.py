from compliance.models.compliance_report import ComplianceReport
from reporting.models.report_compliance_summary import ReportComplianceSummary
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from django.db import transaction
from decimal import Decimal
from compliance.models.compliance_report_version import ComplianceReportVersion
import logging

logger = logging.getLogger(__name__)


class ComplianceReportVersionService:
    @classmethod
    @transaction.atomic
    def create_compliance_report_version(
        cls, compliance_report: ComplianceReport, report_version_id: int
    ) -> ComplianceReportVersion:
        """
        Creates a compliance report version for a submitted report version

        Args:
            report_version_id (int): The ID of the report version
            compliance_report (ComplianceReport): The compliance report to associate with the version

        Returns:
            ComplianceReportVersion: The created compliance report version

        Raises:
            ReportVersion.DoesNotExist: If report version doesn't exist
        """
        with transaction.atomic():
            report_compliance_summary = ReportComplianceSummary.objects.get(report_version_id=report_version_id)

            ## TODO: WILL NEED SUPPLEMENTARY REPORT HANDLING LOGIC HERE (issue pending) ##
            credited_emissions = report_compliance_summary.credited_emissions
            excess_emissions = report_compliance_summary.excess_emissions

            # Create compliance report version
            compliance_report_version = ComplianceReportVersion.objects.create(
                compliance_report=compliance_report,
                report_compliance_summary=report_compliance_summary,
                status=ComplianceReportVersionService._determine_compliance_status(
                    excess_emissions, credited_emissions
                ),
            )

            # Create compliance obligation if there are excess emissions
            if excess_emissions > Decimal('0'):
                obligation = ComplianceObligationService.create_compliance_obligation(
                    compliance_report_version.id, excess_emissions
                )

                # Integration operation - handle eLicensing integration
                # This is done outside of the main transaction to prevent rollback if integration fails
                transaction.on_commit(lambda: cls._process_obligation_integration(obligation.id))

            # TODO: Create earned credits object if there are credited emissions (issue #117)

            return compliance_report_version

    @classmethod
    def _process_obligation_integration(cls, obligation_id: int) -> None:
        """
        Process eLicensing integration for a compliance obligation.

        Args:
            obligation_id: The ID of the compliance obligation to process

        Raises:
            Exception: If integration fails
        """
        try:
            ObligationELicensingService.process_obligation_integration(obligation_id)
        except Exception as e:
            logger.error(
                f"Failed to process eLicensing integration for obligation {obligation_id}: {str(e)}", exc_info=True
            )
            raise

    @classmethod
    def get_compliance_report_version(cls, compliance_report_version_id: int) -> ComplianceReportVersion:
        """
        Gets a compliance compliance_report_version by ID

        Args:
            compliance_report_version_id (int): The ID of the compliance compliance_report_version

        Returns:
            ComplianceReportVersion: The compliance report version record

        Raises:
            ComplianceReportVersion.DoesNotExist: If the compliance report version doesn't exist
        """
        return ComplianceReportVersion.objects.get(id=compliance_report_version_id)

    @staticmethod
    def _determine_compliance_status(excess_emissions: Decimal, credited_emissions: Decimal) -> str:
        """
        Determines the compliance status based on emissions

        Args:
            excess_emissions (Decimal): The excess emissions
            credited_emissions (Decimal): The credited emissions

        Returns:
            str: The compliance status
        """
        if excess_emissions > Decimal('0'):
            return ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        elif credited_emissions > Decimal('0'):
            return ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        else:
            return ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

    @staticmethod
    def calculate_outstanding_balance(compliance_report_version: ComplianceReportVersion) -> Decimal:
        """
        Calculates the outstanding balance for a compliance report_version.
        The balance is equal to excess emissions if excess emissions are greater than 0,
        and 0 otherwise.

        Args:
            compliance_report_version (ComplianceReportVersion): The compliance report version record

        Returns:
            Decimal: The outstanding balance
        """

        # Start with the base outstanding balance (excess emissions if positive, otherwise 0)
        outstanding_balance = max(compliance_report_version.report_compliance_summary.excess_emissions, Decimal('0'))

        # Future extension points:
        # 1. Incorporate monetary payments into the calculation
        # monetary_payments = _get_monetary_payments(compliance_summary)
        # outstanding_balance = calculate_with_monetary_payments(outstanding_balance, monetary_payments)

        # 2. Incorporate compliance credits into the calculation
        # compliance_credits = _get_compliance_credits(compliance_summary)
        # outstanding_balance = calculate_with_compliance_credits(outstanding_balance, compliance_credits)

        return outstanding_balance
