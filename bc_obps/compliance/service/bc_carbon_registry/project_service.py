from typing import Optional, Dict, Any
from common.exceptions import UserError
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.models.compliance_report_version import ComplianceReportVersion
from registration.models import Operation, Facility


class BCCarbonRegistryProjectService:
    def __init__(self) -> None:
        self.client = BCCarbonRegistryAPIClient()

    def create_project(self, account_id: str, compliance_report_version: ComplianceReportVersion) -> Dict:
        """
        Creates a project in the BC Carbon Registry (BCCR) for a compliance report version.

        This method creates a project in BCCR with appropriate address information based on operation type (SFO/LFO).

        Args:
            account_id: The BCCR account ID to associate with the project
            compliance_report_version: The compliance report version

        Raises:
            UserError: If operation type is not SFO or LFO, project creation fails,
        """

        compliance_period = compliance_report_version.compliance_report.compliance_period
        operation = compliance_report_version.compliance_report.report.operation
        operation_type = operation.type

        address_related_fields: Dict[str, Any] = {}
        if operation_type == Operation.Types.SFO:
            facility: Optional[Facility] = operation.facilities.first()  # SFO operations have a single facility

            # Two below assertions are to make mypy happy, but we are sure that facility is not None
            if not facility:
                raise UserError("SFO operation must have at least one facility.")
            if not all([facility.latitude_of_largest_emissions, facility.longitude_of_largest_emissions]):
                raise UserError("Facility must have latitude and longitude for SFO operations.")
            address_related_fields = {
                "latitude": str(facility.latitude_of_largest_emissions),
                "longitude": str(facility.longitude_of_largest_emissions),
            }
        elif operation_type == Operation.Types.LFO:
            mailing_address = operation.operator.mailing_address

            # Two below assertions are to make mypy happy, but we are sure that mailing_address is not None
            if not mailing_address:
                raise UserError("Operator must have a mailing address for LFO operations.")
            if not all([mailing_address.street_address, mailing_address.municipality, mailing_address.postal_code]):
                raise UserError(
                    "Mailing address must have street address, municipality, and postal code for LFO operations."
                )
            address_related_fields = {
                "city": mailing_address.municipality,
                "address_line_1": mailing_address.street_address,
                "zipcode": mailing_address.postal_code,
                "province": mailing_address.province,
            }

        if not address_related_fields:
            raise UserError("Operation type must be SFO or LFO to create a project in BCCR.")

        operation_name = operation.name
        compliance_period_end_date_year = compliance_period.end_date.year
        # Hardcoded value based on the Business Area decision
        project_description = f"The B.C. OBPS, established under the Greenhouse Gas Industrial Reporting and Control Act (GGIRCA), is a carbon pricing system that incentivizes emission reductions through performance-based targets. The Director under GGIRCA issued earned credits to {operation_name} because their verified emissions were below their emission limit in {compliance_period_end_date_year} B.C. Output Based Pricing System (OBPS)."
        project_data = {
            "account_id": account_id,
            "project_name": f"{operation_name} {compliance_period_end_date_year}",
            "project_description": project_description,
            "mixedUnitList": [
                {
                    **address_related_fields,
                    "period_start_date": compliance_period.start_date.strftime("%Y-%m-%d"),
                    "period_end_date": compliance_period.end_date.strftime("%Y-%m-%d"),
                }
            ],
        }
        response = self.client.create_project(project_data=project_data)
        if not response.get("id"):  # make sure the project was created successfully
            raise UserError("Failed to create project in BCCR")
        return response
