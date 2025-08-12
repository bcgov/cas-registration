from dataclasses import asdict
from typing import Dict, List, Optional, Any
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
from common.exceptions import UserError
from compliance.dataclass import ComplianceUnitsPageData, BCCRUnit, TransferComplianceUnitsPayload, MixedUnit
from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.compliance_obligation_service import ComplianceObligationService
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService

from decimal import Decimal
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from django.db.models import Sum

bccr_account_service = BCCarbonRegistryAccountService()


class ApplyComplianceUnitsService:
    @classmethod
    def _get_total_adjustments_for_report_version_by_reason(
        cls, compliance_report_version_id: int, reason: str
    ) -> Decimal:
        """
        Helper to retrieve total adjustments (value already applied) for a compliance report version.
        Results filtered on "reason" as adjustments from supplementary reports need to be considered when calculating the overall cap
        where adjustments from compliance units are to be considered when determining the cap remaining
        """
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )

        invoice = refresh_result.invoice
        if not invoice:
            return Decimal("0")

        line_items = invoice.elicensing_line_items.all()
        total_adjustments = ElicensingAdjustment.objects.filter(
            elicensing_line_item__in=line_items, reason=reason
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

        return total_adjustments

    @classmethod
    def _calculate_apply_units_cap(cls, compliance_report_version_id: int) -> Decimal:
        """
        Retrieves the obligation for the given compliance report version ID and calculates the maximum
        allowable value for applied compliance units as 50% of (the original fee less any adjustments due to supplementary report submissions).

        Raises:
            UserError: If the obligation is missing or the fee_amount_dollars is not available.
        """
        obligation = ComplianceObligationService.get_obligation_for_report_version(compliance_report_version_id)
        if not obligation or not obligation.fee_amount_dollars:
            raise UserError("Unable to calculate unit cap: missing obligation or fee amount.")
        total_supplementary_report_adjustments = cls._get_total_adjustments_for_report_version_by_reason(
            compliance_report_version_id=compliance_report_version_id, reason='Supplementary Report Adjustment'
        )
        return (obligation.fee_amount_dollars + total_supplementary_report_adjustments) * Decimal(
            "0.5"
        )  # 50% of (original amount less any adjustments due to supplementary reports)

    @classmethod
    def _compute_compliance_unit_caps(cls, compliance_report_version_id: int) -> tuple[Decimal, Decimal]:
        """
        Returns (compliance_unit_cap_limit, compliance_unit_cap_remaining).
        """
        obligation_data = ComplianceObligationService.get_obligation_data_by_report_version(
            compliance_report_version_id
        )

        if not obligation_data or obligation_data.fee_amount_dollars is None:
            return Decimal("0"), Decimal("0")

        compliance_unit_cap_limit = cls._calculate_apply_units_cap(compliance_report_version_id)

        total_compliance_unit_adjustments = cls._get_total_adjustments_for_report_version_by_reason(
            compliance_report_version_id=compliance_report_version_id, reason='Compliance Units Applied'
        )

        compliance_unit_cap_remaining = max(Decimal("0"), compliance_unit_cap_limit + total_compliance_unit_adjustments)

        return compliance_unit_cap_limit, compliance_unit_cap_remaining

    @classmethod
    def _can_apply_compliance_units(cls, compliance_report_version_id: int) -> bool:
        """
        Returns True if:
        * There is a valid obligation with a fee > 0.
        * Outstanding balance / equivalent value is > 0.
        * There is remaining cap to apply (50% of original fee minus already applied adjustments).
        """
        # Get cap limit and remaining (handles missing obligation or fee internally).
        cap_limit, cap_remaining = cls._compute_compliance_unit_caps(compliance_report_version_id)

        if cap_limit <= 0:
            return False  # no original fee or fee was zero
        if cap_remaining <= 0:
            return False  # cap already exhausted

        # Verify obligation and outstanding-equivalent value exist and are positive.
        obligation_data = ComplianceObligationService.get_obligation_data_by_report_version(
            compliance_report_version_id
        )
        if not obligation_data:
            return False

        # Use whichever field represents the current obligation balance (e.g., equivalent_value).
        if obligation_data.equivalent_value <= 0:
            return False

        return True

    @classmethod
    def _validate_quantity_limits(cls, payload: Dict[str, Any], compliance_report_version_id: int) -> None:
        """
        Validates two things:
        1. That the total equivalent value in the payload does not exceed the remaining cap
        (50% of the original fee minus already applied adjustments).
        2. That for each unit in the payload, the quantity to be applied does not exceed the available quantity.

        Args:
            payload: Dictionary that must include 'bccr_units' (a list of unit dicts) and
                    'total_equivalent_value' representing the overall value to apply.
            compliance_report_version_id: Used to fetch the obligation and compute the fee cap.

        Raises:
            UserError: If any of the validations fail.
        """
        # Compute cap limit and remaining (accounts for prior applied adjustments).
        _, compliance_unit_cap_remaining = cls._compute_compliance_unit_caps(compliance_report_version_id)

        total_equivalent_value = Decimal(payload.get("total_equivalent_value", "0"))

        if total_equivalent_value > compliance_unit_cap_remaining:
            raise UserError(
                f"Total equivalent value of units ({total_equivalent_value}) exceeds remaining cap "
                f"({compliance_unit_cap_remaining})."
            )

        # Validate each unit's quantity.
        for unit in payload.get("bccr_units", []):
            qty_to_apply = unit.get("quantity_to_be_applied", 0)
            qty_available = unit.get("quantity_available", 0)
            if qty_to_apply > qty_available:
                raise UserError(
                    f"Quantity to be applied ({qty_to_apply}) exceeds available quantity ({qty_available}) "
                    f"for unit {unit.get('serial_number', 'Unknown')}."
                )

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
                compliance_unit_cap_limit=None,
                compliance_unit_cap_remaining=None,
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

        # Compute compiance unit cap limit and remaining cap
        compliance_unit_cap_limit, compliance_unit_cap_remaining = cls._compute_compliance_unit_caps(
            compliance_report_version_id
        )

        return ComplianceUnitsPageData(
            bccr_trading_name=bccr_compliance_account.master_account_name,
            bccr_compliance_account_id=bccr_compliance_account.entity_id,
            charge_rate=ComplianceChargeRateService.get_rate_for_year(compliance_report.report.reporting_year),
            outstanding_balance=outstanding_balance,
            bccr_units=cls._format_bccr_units_for_grid_display(bccr_units.get("entities", [])),
            compliance_unit_cap_limit=compliance_unit_cap_limit,
            compliance_unit_cap_remaining=compliance_unit_cap_remaining,
        )

    @classmethod
    def apply_compliance_units(
        cls, account_id: str, compliance_report_version_id: int, payload: Dict[str, Any]
    ) -> None:
        """
        Transfers eligible BCCR units from a holding account to a compliance account and records an adjustment.

        1. Validates whether the compliance report version is eligible to receive applied units.
        2. Validates that the total equivalent value does not exceed the compliance unit applied cap,
           and that no unit is attempting to apply more than is available.
        3. Constructs and sends a payload to transfer the units using an external BCCR service.
        4. Creates an adjustment record if the transfer is successful.

        Args:
            account_id (str): The ID of the holding account with the BCCR units.
            compliance_report_version_id (int): The report version associated with the obligation.
            payload (Dict[str, Any]): Data including selected unit details, target compliance account ID,
                                      and the total equivalent value being applied.

        Raises:
            UserError: If any validation or transfer step fails.
        """
        # Check we are working with fresh elicensing data
        refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
        if not refresh_result.data_is_fresh:
            raise UserError("Unable to proceed: E-Licensing data is not up to date. Please try again later.")

        # Check overall eligibility for applying compliance units.
        if not cls._can_apply_compliance_units(compliance_report_version_id):
            raise UserError("Quantity to be applied exceeds 50% of the original obligation fee.")

        # Validate the payload against global and per-unit limits.
        cls._validate_quantity_limits(payload, compliance_report_version_id)

        # Construct the payload to transfer units to the compliance account.
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
            ComplianceAdjustmentService.create_adjustment_for_current_version(
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
