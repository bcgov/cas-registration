from typing import Dict, Optional, Any, TypeVar, cast
from compliance.models import ComplianceReportVersion
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.dataclass import BCCRAccountResponseDetails, BCCRComplianceAccountResponseDetails

T = TypeVar('T', bound=Dict[str, Any])


class BCCarbonRegistryService:
    """Service layer for BC Carbon Registry operations."""

    def __init__(self) -> None:
        self.client = BCCarbonRegistryAPIClient()

    @staticmethod
    def _get_first_entity(response: Optional[Dict[str, Any]]) -> Optional[T]:
        """Extract the first entity from a BCCR API response.

        Most BCCR API responses wrap entities in a list, even when returning a single item.
        This helper safely extracts the first item when it exists.
        """
        entities = response.get("entities") if response else None
        if entities and isinstance(entities, list) and len(entities) > 0:
            return cast(T, entities[0])
        return None

    def get_account_details(self, account_id: str) -> Optional[BCCRAccountResponseDetails]:
        """Retrieve account details from BCCR.

        Args:
            account_id: The BCCR account identifier

        Returns:
            Account details including trading name and classification, or None if not found
        """
        account_details = self.client.get_account_details(account_id=account_id)
        account_details_dict = self._get_first_entity(account_details)

        if not account_details_dict:
            return None

        return BCCRAccountResponseDetails(
            entity_id=account_details_dict.get("entityId"),
            organization_classification_id=account_details_dict.get("organizationClassificationId"),
            type_of_account_holder=account_details_dict.get("type_of_account_holder"),
            trading_name=account_details_dict.get("tradingName"),
        )

    @staticmethod
    def _get_type_of_organization(type_of_account_holder: Optional[str]) -> Optional[str]:
        """Map account holder type to BCCR organization type codes.

        Maps user-friendly account holder types to the numeric codes required by BCCR.
        Used when creating subaccounts.
        """
        type_of_organization_map = {
            "Individual": "140000000000001",
            "Corporation": "140000000000002",
            "Partnership": "140000000000003",
        }
        if type_of_account_holder:
            return type_of_organization_map.get(type_of_account_holder)
        return None

    def create_compliance_account(
        self,
        holding_account_id: str,
        organization_classification_id: str,
        type_of_account_holder: str,
        compliance_year: int,
        boro_id: str,
        compliance_report_version: ComplianceReportVersion,
    ) -> BCCRComplianceAccountResponseDetails:
        """Create a new compliance subaccount in BCCR.

        Creates a compliance-specific subaccount under the main holding account.
        The subaccount is linked to a specific compliance period and boro_id.
        """
        sub_account_payload = {
            "master_account_id": str(holding_account_id),
            "compliance_year": compliance_year,
            "boro_id": boro_id,
            "registered_name": f"{compliance_report_version.compliance_report.report.operation.name} {boro_id}",
            "type_of_organization": self._get_type_of_organization(type_of_account_holder),
            "organization_classification_id": organization_classification_id,
        }

        new_compliance_account_response_dict = self.client.create_sub_account(sub_account_payload)
        new_compliance_account = new_compliance_account_response_dict.get(
            "entity", {}
        )  # passing empty dict to avoid KeyError
        entity_id = new_compliance_account.get("id")
        return BCCRComplianceAccountResponseDetails(
            master_account_name=new_compliance_account.get("parent_name"),
            entity_id=str(entity_id) if entity_id else None,
        )

    def get_or_create_compliance_account(
        self, holding_account_details: BCCRAccountResponseDetails, compliance_report_version: ComplianceReportVersion
    ) -> BCCRComplianceAccountResponseDetails:
        """Retrieve existing compliance account or create new one if not found.

        Looks up a compliance account for the given holding account, compliance period and boro_id.
        If none exists, creates a new compliance subaccount.
        """
        compliance_year = compliance_report_version.compliance_report.compliance_period.end_date.year
        boro_id = compliance_report_version.compliance_report.report.operation.bc_obps_regulated_operation.id  # type: ignore[union-attr]  # an operation must have a boro_id to get to this point

        compliance_account = self.client.get_compliance_account(
            master_account_id=holding_account_details.entity_id, compliance_year=compliance_year, boro_id=boro_id
        )
        existing_compliance_account = self._get_first_entity(compliance_account)

        if existing_compliance_account:
            entity_id = existing_compliance_account.get("entityId")
            return BCCRComplianceAccountResponseDetails(
                master_account_name=existing_compliance_account.get("masterAccountName"),
                entity_id=str(entity_id) if entity_id else None,
            )

        return self.create_compliance_account(
            holding_account_id=holding_account_details.entity_id,
            organization_classification_id=holding_account_details.organization_classification_id,
            type_of_account_holder=holding_account_details.type_of_account_holder,
            compliance_year=compliance_year,
            boro_id=boro_id,
            compliance_report_version=compliance_report_version,
        )
