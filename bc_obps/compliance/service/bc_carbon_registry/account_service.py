from typing import Dict, Optional, Any, TypeVar, cast
from compliance.models import ComplianceReport
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.dataclass import BCCRAccountResponseDetails, BCCRComplianceAccountResponseDetails

T = TypeVar('T', bound=Dict[str, Any])


class BCCarbonRegistryAccountService:

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
        compliance_report: ComplianceReport,
    ) -> BCCRComplianceAccountResponseDetails:
        """Create a new compliance subaccount in BCCR.

        Creates a compliance-specific subaccount under the main holding account.
        The subaccount is linked to a specific compliance period and boro_id.
        """
        sub_account_payload = {
            "master_account_id": str(holding_account_id),
            "compliance_year": compliance_year,
            "boro_id": boro_id,
            "registered_name": f"{compliance_report.report.operation.name} {boro_id}",
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

    def _get_compliance_account_from_bccr(
        self, holding_account_details: BCCRAccountResponseDetails, compliance_year: int, boro_id: str
    ) -> Optional[T]:
        """Retrieve compliance account from BCCR API.

        Args:
            holding_account_details: Details of the holding account
            compliance_year: The compliance year
            boro_id: The BORO ID

        Returns:
            Compliance account details from BCCR if found, None otherwise
        """
        compliance_account = self.client.get_compliance_account(
            master_account_id=holding_account_details.entity_id, compliance_year=compliance_year, boro_id=boro_id
        )
        return self._get_first_entity(compliance_account)

    def _create_and_save_compliance_account(
        self, holding_account_details: BCCRAccountResponseDetails, compliance_report: ComplianceReport
    ) -> BCCRComplianceAccountResponseDetails:
        """Create a new compliance account and save its ID to the compliance report.

        Args:
            holding_account_details: Details of the holding account
            compliance_report: The compliance report to associate with

        Returns:
            Details of the newly created compliance account
        """
        compliance_year = compliance_report.compliance_period.end_date.year
        boro_id = compliance_report.report.operation.bc_obps_regulated_operation.id  # type: ignore[union-attr]

        new_compliance_account = self.create_compliance_account(
            holding_account_id=holding_account_details.entity_id,
            organization_classification_id=holding_account_details.organization_classification_id,
            type_of_account_holder=holding_account_details.type_of_account_holder,
            compliance_year=compliance_year,
            boro_id=boro_id,
            compliance_report=compliance_report,
        )

        # Save the new subaccount ID to the compliance report
        if new_compliance_account.entity_id:
            compliance_report.bccr_subaccount_id = new_compliance_account.entity_id
            compliance_report.save(update_fields=["bccr_subaccount_id"])

        return new_compliance_account

    def get_or_create_compliance_account(
        self, holding_account_details: BCCRAccountResponseDetails, compliance_report: ComplianceReport
    ) -> BCCRComplianceAccountResponseDetails:
        """Retrieve existing compliance account or create new one if not found.

        Looks up a compliance account for the given holding account, compliance period and boro_id.
        If none exists, creates a new compliance subaccount.

        The method prioritizes the locally stored bccr_subaccount_id, but also performs a safety check
        against the BCCR API for cases where we have a subaccount in BCCR but not in local database
        (mostly for dev and test environments, not expected in production).
        """
        # If we already have a bccr_subaccount_id, we know we have an existing subaccount
        if compliance_report.bccr_subaccount_id:
            return BCCRComplianceAccountResponseDetails(
                master_account_name=holding_account_details.trading_name,
                entity_id=compliance_report.bccr_subaccount_id,
            )

        compliance_year = compliance_report.compliance_period.end_date.year
        boro_id = compliance_report.report.operation.bc_obps_regulated_operation.id  # type: ignore[union-attr]

        # This is a safety check for cases where we have a subaccount in BCCR but not in local database
        # (mostly for dev and test environments, not expected in production).
        existing_compliance_account = self._get_compliance_account_from_bccr(
            holding_account_details, compliance_year, boro_id
        )

        if existing_compliance_account:
            entity_id = existing_compliance_account.get("entityId")
            # Save the existing subaccount ID to the compliance report
            compliance_report.bccr_subaccount_id = str(entity_id) if entity_id else None
            compliance_report.save(update_fields=["bccr_subaccount_id"])

            return BCCRComplianceAccountResponseDetails(
                master_account_name=existing_compliance_account.get("masterAccountName"),
                entity_id=str(entity_id) if entity_id else None,
            )

        return self._create_and_save_compliance_account(holding_account_details, compliance_report)
