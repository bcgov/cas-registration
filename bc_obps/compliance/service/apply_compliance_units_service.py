from dataclasses import asdict
from typing import Dict, List, Optional, Any
from common.exceptions import UserError
from compliance.dataclass import ComplianceUnitsPageData, BCCRUnit, TransferComplianceUnitsPayload, MixedUnit
from compliance.service.bc_carbon_registry.bc_carbon_registry_service import BCCarbonRegistryService
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
from compliance.service.compliance_report_version_service import ComplianceReportVersionService

bccr_service = BCCarbonRegistryService()


class ApplyComplianceUnitsService:
    @classmethod
    def _format_bccr_units_for_display(cls, bccr_units: List[Optional[Dict[str, Any]]]) -> List[BCCRUnit]:
        """
        Modify the bccr units to include only the necessary fields and format them appropriately.

        Args:
            bccr_units: List of BCCR unit dictionaries

        Returns:
            List[BCCRUnit]: List of formatted BCCR units with only necessary fields
        """
        # Map the unit type from BCCR to the display name
        unit_type_mapping = {
            "BCE": "Earned Credits",
            "BCO": "Offset Units",
        }

        formatted_units = []
        for unit in bccr_units:
            if not unit:  # to make mypy happy, we need to check if unit is None
                continue

            # Get the unit type and map it to display name, defaulting to None if not found
            unit_type = unit.get("unitType")
            display_type = unit_type_mapping.get(unit_type) if unit_type else None

            formatted_units.append(
                BCCRUnit(
                    id=unit.get("id"),
                    type=display_type,
                    serial_number=unit.get("serialNo"),
                    vintage_year=unit.get("vintage"),
                    quantity_available=unit.get("holdingQuantity"),
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
        holding_account_details = bccr_service.get_account_details(account_id=account_id)
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
        bccr_compliance_account = bccr_service.get_or_create_compliance_account(
            holding_account_details=holding_account_details, compliance_report_version=compliance_report_version
        )
        bccr_units = bccr_service.client.list_all_units(holding_account_id=account_id)

        return ComplianceUnitsPageData(
            bccr_trading_name=bccr_compliance_account.master_account_name,
            bccr_compliance_account_id=bccr_compliance_account.entity_id,
            charge_rate=ComplianceChargeRateService.get_rate_for_year(
                compliance_report_version.report_compliance_summary.report_version.report.reporting_year
            ),
            # TODO: This value is hardcoded for now, We need to implement the logic to fetch the actual outstanding balance in ticket #193
            outstanding_balance="16000",
            bccr_units=cls._format_bccr_units_for_display(bccr_units.get("entities", [])),
        )

    @classmethod
    def _validate_quantity_limits(cls, units: List[Dict[str, Any]]) -> None:
        """
        Validates that quantity_to_be_applied doesn't exceed quantity_available for each unit.

        Args:
            units: List of unit dictionaries with quantity_available and quantity_to_be_applied fields.

        Raises:
            UserError: If any unit has quantity_to_be_applied greater than quantity_available.
        """
        for unit in units:
            if unit.get("quantity_to_be_applied", 0) > unit.get("quantity_available", 0):
                raise UserError(
                    f"Quantity to be applied exceeds available quantity for unit {unit.get('serial_number', 'Unknown')}"
                )

    @classmethod
    def apply_compliance_units(cls, account_id: str, payload: Dict[str, Any]) -> None:
        """
        Applies compliance units to a BCCR compliance account. (Transfers units from holding account to compliance account)

        Args:
            account_id (str): BCCR holding account ID.
            payload (Dict[str, Any]): Data model for the Apply Compliance Units page data as dictionary.
        """
        cls._validate_quantity_limits(payload["bccr_units"])

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
        bccr_service.client.transfer_compliance_units(asdict(transfer_compliance_units_payload))
