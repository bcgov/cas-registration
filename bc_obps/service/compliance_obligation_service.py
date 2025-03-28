from datetime import date
from decimal import Decimal
from reporting.models.report_version import ReportVersion
from django.db import transaction
from compliance.models import ComplianceObligation, ComplianceSummary
from service.operator_elicensing_service import OperatorELicensingService
import logging
import requests

logger = logging.getLogger(__name__)


class ComplianceObligationService:
    """
    Service for managing compliance obligations
    """

    @classmethod
    def create_compliance_obligation(
        cls, compliance_summary_id: int, emissions_amount: Decimal, report_version: ReportVersion
    ) -> ComplianceObligation:
        """
        Creates a compliance obligation for a compliance summary

        Args:
            compliance_summary_id (int): The ID of the compliance summary
            emissions_amount (Decimal): The amount of excess emissions in tCO2e
            report_version (ReportVersion): The report version for calculating the obligation deadline and obligation_id

        Returns:
            ComplianceObligation: The created compliance obligation

        Raises:
            ComplianceSummary.DoesNotExist: If the compliance summary doesn't exist
            ValueError: If the operation is not regulated by BC OBPS (no obligation_id can be generated)
        """
        with transaction.atomic():
            compliance_summary = ComplianceSummary.objects.get(id=compliance_summary_id)

            # Set obligation deadline to November 30 of the following year
            # per section 19(1)(b) of BC Greenhouse Gas Emission Reporting Regulation
            obligation_deadline = cls.get_obligation_deadline(report_version.report.reporting_year_id)

            obligation = ComplianceObligation.objects.create(
                compliance_summary=compliance_summary,
                emissions_amount_tco2e=emissions_amount,
                status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
                penalty_status=ComplianceObligation.PenaltyStatus.NONE,
                obligation_deadline=obligation_deadline,
                obligation_id=cls._get_obligation_id(report_version),
            )

            # Ensure an eLicensing client exists for the operator
            try:
                operator = compliance_summary.report.operator

                # Ensure an eLicensing client exists for this operator
                client_link = OperatorELicensingService.ensure_client_exists(operator.id)

                if client_link is not None:
                    logger.info(
                        f"eLicensing client for operator {operator.id} with client ID {client_link.elicensing_object_id}"
                    )
                else:
                    logger.warning(f"Failed to create or find eLicensing client for operator {operator.id}")

            except AttributeError:
                logger.error(f"Compliance summary {compliance_summary.id} has no associated report or operator")
            except requests.RequestException as e:
                logger.error(f"eLicensing API error creating client for compliance obligation: {str(e)}")
            except Exception as e:
                logger.error(
                    f"Error ensuring eLicensing client exists for compliance obligation {obligation.id}: {str(e)}"
                )

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
            ValueError: If the operation is not regulated by BC OBPS
        """
        # Get BORO ID (format: YY-OOOO)
        operation = report_version.report.operation
        if operation.bc_obps_regulated_operation is None:
            raise ValueError(
                f"Cannot create a compliance obligation for an operation not regulated by BC OBPS. Operation ID: {operation.id}, Operation Name: {operation.name}"
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
    def get_obligation_for_summary(cls, compliance_summary_id: int) -> ComplianceObligation:
        """
        Gets the compliance obligation for a compliance summary

        Args:
            compliance_summary_id (int): The ID of the compliance summary

        Returns:
            ComplianceObligation: The compliance obligation

        Raises:
            ComplianceObligation.DoesNotExist: If no obligation exists for the summary
        """
        return ComplianceObligation.objects.get(compliance_summary_id=compliance_summary_id)
