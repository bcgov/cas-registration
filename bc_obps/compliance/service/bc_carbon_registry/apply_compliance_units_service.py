from dataclasses import asdict
from typing import Dict, List, Optional, Any
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from common.exceptions import UserError
from compliance.dataclass import ComplianceUnitsPageData, BCCRUnit, TransferComplianceUnitsPayload, MixedUnit
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.compliance_obligation_service import ComplianceObligationService
from decimal import Decimal
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from django.db.models import Sum

bccr_account_service = BCCarbonRegistryAccountService()


class ApplyComplianceUnitsService:

    @classmethod
    def _can_apply_units(cls, compliance_report_version_id: int) -> bool:
        """
        Determines whether a user is allowed to apply compliance units for a given compliance report version.

        Returns True only if:
        - The obligation exists.
        - The original fee amount (fee_amount_dollars) is greater than 0.
        - There is a remaining outstanding balance > 0.
        - The total adjustments (credits already applied) do not exceed 50% of the original obligation fee.
        """
        # Retrieve the obligation linked to the compliance report version
        obligation = ComplianceObligationService.get_obligation_for_report_version(
            compliance_report_version_id
        )

        if not obligation:
            # No obligation found — cannot apply units
            return False

        # Original total fee amount (before payments or adjustments)
        fee_amount_dollars = obligation.fee_amount_dollars
        if not fee_amount_dollars:
            # If there's no fee, nothing to apply units toward
            return False

        # Maximum allowable value of applied units (50% of the original fee)
        apply_units_cap = fee_amount_dollars * Decimal("0.5")

        # --- Check whether any balance remains to be paid ---
        outstanding_balance = (
            obligation.elicensing_invoice.outstanding_balance
            if obligation.elicensing_invoice
            else Decimal("0")
        )
        if outstanding_balance <= 0:
            # Nothing left to pay — no need to apply units
            return False

        # --- Check how much has already been applied via adjustments ---
        line_items = (
            obligation.elicensing_invoice.elicensing_line_items.all()
            if obligation.elicensing_invoice else []
        )

        total_adjustments = ElicensingAdjustment.objects.filter(
            elicensing_line_item__in=line_items
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        if total_adjustments >= apply_units_cap:
            # Already applied the max allowed credits
            return False

        # All checks passed — user can apply more units
        return True


    @classmethod
    def _format_bccr_units_for_grid_display(cls, bccr_units: List[Optional[Dict[str, Any]]]) -> List[BCCRUnit]:
        """
        Unified function to format BCCR units for different use cases.

        Args:
            bccr_units: List of BCCR unit dictionaries

        Returns:
            List of formatted BCCRUnit objects with all possible fields populated
        """
        formatted_units = []
        for unit in bccr_units:
            if not unit:  # to make mypy happy, we need to check if unit is None
                continue

            unit_type = unit.get("unitType")
            unit_type_mapping = {
                "BCE": "Earned Credits",
                "BCO": "Offset Units",
            }
            display_type = unit_type_mapping.get(unit_type) if unit_type else None
            holding_quantity = unit.get("holdingQuantity")

            # Populate all possible fields - the dataclass handles which ones are relevant
            formatted_units.append(
                BCCRUnit(
                    id=unit.get("id"),
                    type=display_type,
                    serial_number=unit.get("serialNo"),
                    vintage_year=unit.get("vintage"),
                    quantity_available=holding_quantity,
                    quantity_applied=str(holding_quantity),
                )
            )

        return formatted_units

    @classmethod
    def get_apply_compliance_units_page_data(
        cls, account_id: str, compliance_report_version_id: int
    ) -> ComplianceUnitsPageData:
        """
        Retrieves and consolidates data for the Apply Compliance Units page.

        Args:
            account_id (str): BCCR holding account ID.
            compliance_report_version_id (int): Compliance report version ID.

        Returns:
            ComplianceUnitsPageData: Data for the Apply Compliance Units page.
        """
        holding_account_details = bccr_account_service.get_account_details(account_id=account_id)
        # If no holding account details are found, exit early with None values
        if not holding_account_details:
            return ComplianceUnitsPageData(
                bccr_trading_name=None,
                bccr_compliance_account_id=None,
                charge_rate=None,
                outstanding_balance=None,
                bccr_units=[],
            )

        compliance_report_version = ComplianceReportVersionService.get_compliance_report_version(
            compliance_report_version_id
        )
        compliance_report = compliance_report_version.compliance_report
        bccr_compliance_account = bccr_account_service.get_or_create_compliance_account(
            holding_account_details=holding_account_details,
            compliance_report=compliance_report,
            compliance_report_version=compliance_report_version,
        )
        bccr_units = bccr_account_service.client.list_all_units(account_id=account_id)

        obligation_data = ComplianceObligationService.get_obligation_data_by_report_version(
            compliance_report_version_id
        )
        outstanding_balance = obligation_data.equivalent_value
        fee_amount_dollars = obligation_data.fee_amount_dollars

        return ComplianceUnitsPageData(
            bccr_trading_name=bccr_compliance_account.master_account_name,
            bccr_compliance_account_id=bccr_compliance_account.entity_id,
            charge_rate=ComplianceChargeRateService.get_rate_for_year(compliance_report.report.reporting_year),
            outstanding_balance=outstanding_balance,
            fee_amount_dollars=fee_amount_dollars,
            bccr_units=cls._format_bccr_units_for_grid_display(bccr_units.get("entities", [])),
        )

    @classmethod
    def _validate_quantity_limits(cls, compliance_report_version_id: int, units: List[Dict[str, Any]]) -> None:
        """
        Validates:
        - The total compliance units can be applied (i.e., the 50% cap has not already been reached).
        - Each unit's quantity_to_be_applied does not exceed quantity_available.

        Args:
            compliance_report_version_id: ID of the compliance report version to validate against.
            units: List of unit dictionaries with quantity_available and quantity_to_be_applied fields.

        Raises:
            UserError: If applying units is disallowed or a unit exceeds quantity_available.
        """
        # Cap check: prevent applying units if already at 50% threshold
        if not cls._can_apply_units(compliance_report_version_id):
            raise UserError("Cannot apply more units: 50% credit cap already reached.")

        # Per-unit validation: ensure each unit's requested quantity is available
        for unit in units:
            if unit.get("quantity_to_be_applied", 0) > unit.get("quantity_available", 0):
                raise UserError(
                    f"Quantity to be applied exceeds available quantity for unit {unit.get('serial_number', 'Unknown')}"
                )

    @classmethod
    def apply_compliance_units(
        cls, account_id: str, compliance_report_version_id: int, payload: Dict[str, Any]
    ) -> None:
        """
        Applies compliance units to a BCCR compliance account. (Transfers units from holding account to compliance account)

        Args:
            account_id (str): BCCR holding account ID.
            compliance_report_version_id (int): Compliance report version ID.
            payload (Dict[str, Any]): Data model for the Apply Compliance Units page data as dictionary.
        """
        cls._validate_quantity_limits(compliance_report_version_id, payload["bccr_units"])

        transfer_compliance_units_payload = TransferComplianceUnitsPayload(
            destination_account_id=payload["bccr_compliance_account_id"],
            mixedUnitList=[
                MixedUnit(
                    account_id=account_id,
                    serial_no=unit["serial_number"],
                    new_quantity=unit["quantity_to_be_applied"],
                    id=unit["id"],
                )
                for unit in payload["bccr_units"]
                if unit.get("quantity_to_be_applied") and unit["quantity_to_be_applied"] > 0
            ],
        )
        response = bccr_account_service.client.transfer_compliance_units(asdict(transfer_compliance_units_payload))
        if response.get("success"):
            ComplianceAdjustmentService.create_adjustment(
                compliance_report_version_id=compliance_report_version_id,
                adjustment_total=-Decimal(payload["total_equivalent_value"]),
            )

    @classmethod
    def get_applied_compliance_units_data(cls, compliance_report_version_id: int) -> List[BCCRUnit]:
        """
        Retrieves applied compliance units for a compliance report version.

        This method gets the compliance account associated with the compliance report version
        and retrieves the units that have been applied to that account.

        Args:
            compliance_report_version_id (int): The ID of the compliance report version.

        Returns:
            List of BCCRUnit objects for grid display
        """
        compliance_report_version = ComplianceReportVersionService.get_compliance_report_version(
            compliance_report_version_id
        )
        bccr_subaccount_id = compliance_report_version.compliance_report.bccr_subaccount_id

        if not bccr_subaccount_id:
            return []

        # When fetching applied units, we have to use both ACTIVE and RETIRED states
        # ACTIVE units are those that are applied but not yet retired by industry users,
        # while RETIRED units are those that have been retired by industry users.
        applied_units = bccr_account_service.client.list_all_units(
            account_id=bccr_subaccount_id, state_filter="ACTIVE,RETIRED"
        )
        formatted_units = cls._format_bccr_units_for_grid_display(applied_units.get("entities", []))

        # Calculate equivalent_value for each unit based on charge rate
        charge_rate = ComplianceChargeRateService.get_rate_for_year(
            compliance_report_version.compliance_report.report.reporting_year
        )

        for unit in formatted_units:
            if unit.quantity_applied:
                # Convert quantity_applied to Decimal for calculation
                quantity_applied = Decimal(str(unit.quantity_applied))
                equivalent_value_decimal = (quantity_applied * charge_rate).quantize(Decimal('0.01'))
                unit.equivalent_value = str(equivalent_value_decimal)

        return formatted_units
