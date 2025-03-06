from datetime import date
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from compliance.models import ComplianceObligation, ComplianceSummary


class ComplianceObligationService:
    """
    Service for managing compliance obligations
    """

    @classmethod
    def create_compliance_obligation(
        cls, compliance_summary_id: int, emissions_amount: Decimal, reporting_year: int
    ) -> ComplianceObligation:
        """
        Creates a compliance obligation for a compliance summary

        Args:
            compliance_summary_id (int): The ID of the compliance summary
            emissions_amount (Decimal): The amount of excess emissions in tCO2e
            reporting_year (int): The reporting year for calculating the obligation deadline

        Returns:
            ComplianceObligation: The created compliance obligation

        Raises:
            ComplianceSummary.DoesNotExist: If the compliance summary doesn't exist
        """
        with transaction.atomic():
            compliance_summary = ComplianceSummary.objects.get(id=compliance_summary_id)

            # Set obligation deadline to November 30 of the following year
            # per section 19(1)(b) of BC Greenhouse Gas Emission Reporting Regulation
            obligation_deadline = cls.get_obligation_deadline(reporting_year)

            obligation = ComplianceObligation.objects.create(
                compliance_summary=compliance_summary,
                emissions_amount_tco2e=emissions_amount,
                status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
                penalty_status=ComplianceObligation.PenaltyStatus.NONE,
                obligation_deadline=obligation_deadline,
            )

            return obligation

    @classmethod
    def get_obligation_deadline(cls, year: int) -> date:
        """
        Gets the excess emissions obligation deadline for a year (November 30 of following year)

        Args:
            year (int): The compliance period year

        Returns:
            date: The excess emissions obligation deadline (November 30 of following year)
        """
        # Per section 19(1)(b) of BC Greenhouse Gas Emission Reporting Regulation
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

        # Validate status
        if new_status not in [choice[0] for choice in ComplianceObligation.ObligationStatus.choices]:
            raise ValidationError(f"Invalid obligation status: {new_status}")

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

        # Validate status
        if new_status not in [choice[0] for choice in ComplianceObligation.PenaltyStatus.choices]:
            raise ValidationError(f"Invalid penalty status: {new_status}")

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
