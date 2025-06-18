from typing import Dict, List, Optional, Any
from compliance.dataclass import BCCRUnit, ComplianceUnitsPageData
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
            # TODO: Ticket #206
            outstanding_balance="16000",
            bccr_units=cls._format_bccr_units_for_display(bccr_units.get("entities", [])),
        )
