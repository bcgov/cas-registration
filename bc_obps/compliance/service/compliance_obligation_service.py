from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from django.core.exceptions import ValidationError
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from reporting.models.report_version import ReportVersion
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from django.db import transaction
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
import logging

logger = logging.getLogger(__name__)


class ComplianceObligationService:
    """
    Service for managing compliance obligations
    """

    @classmethod
    @transaction.atomic
    def create_compliance_obligation(
        cls, compliance_report_version_id: int, emissions_amount: Decimal
    ) -> ComplianceObligation:
        """
        Creates a compliance obligation for a compliance report version.
        This method focuses purely on domain logic - creating the obligation record.
        Integration with external systems is handled by separate services.

        Args:
            compliance_report_version_id (int): The ID of the compliance report version
            emissions_amount (Decimal): The amount of excess emissions in tCO2e

        Returns:
            ComplianceObligation: The created compliance obligation

        Raises:
            ComplianceReportVersion.DoesNotExist: If the compliance report version doesn't exist
            ComplianceChargeRate.DoesNotExist: If no compliance charge rate exists for the reporting year
            ValueError: If the operation is not regulated by BC OBPS (no obligation_id can be generated)
        """
        # Get the compliance report_version
        compliance_report_version = ComplianceReportVersion.objects.get(id=compliance_report_version_id)

        # Calculate obligation deadline (November 30 of the following year)
        obligation_deadline = date(
            compliance_report_version.report_version.report.reporting_year.reporting_year + 1, 11, 30
        )

        # Get the compliance charge rate for the reporting year
        fee_rate_dollars = ComplianceChargeRateService.get_rate_for_year(
            compliance_report_version.report_version.report.reporting_year
        )

        # Calculate fee amount: emissions_amount_tco2e * fee rate
        fee_amount_dollars = (emissions_amount * fee_rate_dollars).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Create the obligation with fee data
        obligation = ComplianceObligation.objects.create(
            compliance_report_version=compliance_report_version,
            obligation_id=cls._get_obligation_id(compliance_report_version.report_version),
            obligation_deadline=obligation_deadline,
            fee_amount_dollars=fee_amount_dollars,
            fee_created_at=date.today(),
            penalty_status=ComplianceObligation.PenaltyStatus.NONE,
        )

        logger.info(f"Created compliance obligation {obligation.id} for report version {compliance_report_version_id}")

        return obligation

    @classmethod
    def _get_obligation_id(cls, report_version: ReportVersion) -> str:
        """
        Format the obligation ID as "YY-OOOO-R-V" where:
        - YY-OOOO = BORO ID (from bc_obps_regulated_operation)
        - R = Report ID
        - V = Report version ID

        Example: "21-0001-1-1"

        Returns:
            str: The formatted obligation ID

        Raises:
            ValidationError: If the operation is not regulated by BC OBPS
        """
        # Get BORO ID (format: YY-OOOO)
        operation = report_version.report.operation
        if operation.bc_obps_regulated_operation is None:
            raise ValidationError(
                f"Cannot create a compliance obligation for an operation not regulated by BC OBPS. Operation ID: {operation.id}"
            )

        operation_part = operation.bc_obps_regulated_operation.id

        # Get report (R) and version (V) IDs
        report_id = str(report_version.report.id)
        version_id = str(report_version.id)

        # Format the complete obligation ID
        return f"{operation_part}-{report_id}-{version_id}"

    @classmethod
    def get_obligation_deadline(cls, year: int) -> date:
        """
        Gets the excess emissions obligation deadline for a year (November 30 of following year)

        Args:
            year (int): The compliance period year

        Returns:
            date: The excess emissions obligation deadline (November 30 of following year)
        """
        # Per section 19(1)(b) of BCGGE Reporting Regulation
        return date(year + 1, 11, 30)

    @classmethod
    def update_obligation_status(cls, obligation_id: int, new_status: str) -> ComplianceObligation:
        """
        Updates the status of a compliance obligation

        Args:
            obligation_id (int): The ID of the compliance obligation
            new_status (str): The new status (use ComplianceObligation.ObligationStatus choices)

        Returns:
            ComplianceObligation: The updated compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If the compliance obligation doesn't exist
            ValidationError: If the new status is invalid
        """
        obligation = ComplianceObligation.objects.get(id=obligation_id)

        obligation.status = new_status
        obligation.save()

        return obligation

    @classmethod
    def update_penalty_status(cls, obligation_id: int, new_status: str) -> ComplianceObligation:
        """
        Updates the penalty status of a compliance obligation

        Args:
            obligation_id (int): The ID of the compliance obligation
            new_status (str): The new penalty status (use ComplianceObligation.PenaltyStatus choices)

        Returns:
            ComplianceObligation: The updated compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If the compliance obligation doesn't exist
            ValidationError: If the new status is invalid
        """
        obligation = ComplianceObligation.objects.get(id=obligation_id)

        obligation.penalty_status = new_status
        obligation.save()

        return obligation

    @classmethod
    def get_obligation_for_report_version(cls, compliance_report_version_id: int) -> ComplianceObligation:
        """
        Gets the compliance obligation for a compliance report_version

        Args:
            compliance_report_version_id (int): The ID of the compliance report_version

        Returns:
            ComplianceObligation: The compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If no obligation exists for the compliance report version
        """
        return ComplianceObligation.objects.get(compliance_report_version_id=compliance_report_version_id)
