from typing import Dict
from common.exceptions import UserError
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit


class BCCarbonRegistryCreditIssuanceService:
    def __init__(self) -> None:
        self.client = BCCarbonRegistryAPIClient()

    def issue_credits(self, earned_credit: ComplianceEarnedCredit, bccr_project_data: Dict) -> None:
        """
        Issues earned credits in the BC Carbon Registry (BCCR) for a compliance report.

        This method creates a credit issuance request in BCCR by sending the earned credits
        data along with project information. The credits are issued to the operator's
        holding account for the specified compliance period.

        Args:
            earned_credit (ComplianceEarnedCredit): The earned credit record containing
                the amount of credits to issue, BCCR account information, and compliance
                period details.
            bccr_project_data (Dict): Project data from BCCR containing mixed unit
                information, project ID, and location details.
        """
        compliance_period = earned_credit.compliance_report_version.compliance_report.compliance_period

        # Vintage Period End must be on or before the Verification Period End
        # Vintage Period Start must be on or after the Verification Period Start
        compliance_period_start_date = compliance_period.start_date
        compliance_period_end_date = compliance_period.end_date
        verification_date_start = compliance_period_start_date.strftime("%d/%m/%Y")
        verification_date_end = compliance_period_end_date.strftime("%d/%m/%Y")

        mixed_unit_data = bccr_project_data["mixedUnitList"][0]
        credits_issuance_payload = {
            "account_id": earned_credit.bccr_holding_account_id,
            "issuance_requested_date": (
                earned_credit.issuance_requested_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                if earned_credit.issuance_requested_date
                else None
            ),
            "project_id": str(bccr_project_data["id"]),
            "verifications": [
                {
                    "verificationStartDate": verification_date_start,
                    "verificationEndDate": verification_date_end,
                    "monitoringPeriod": f"{verification_date_start} - {verification_date_end}",
                    "mixedUnits": [
                        {
                            "holding_quantity": earned_credit.earned_credits_amount,
                            "vintage_start": compliance_period_start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                            "vintage_end": compliance_period_end_date.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                            "city": mixed_unit_data["city"],
                            "address_line_1": mixed_unit_data["address_line_1"],
                            "zipcode": mixed_unit_data["zipcode"],
                            "latitude": str(mixed_unit_data["latitude"]) if mixed_unit_data["latitude"] else None,
                            "longitude": str(mixed_unit_data["longitude"]) if mixed_unit_data["longitude"] else None,
                            "defined_unit_id": str(mixed_unit_data["id"]),
                            "project_type_id": str(mixed_unit_data["project_type_id"]),
                        }
                    ],
                }
            ],
        }
        response = self.client.create_issuance(issuance_data=credits_issuance_payload)
        if not response.get("id"):
            raise UserError("Failed to issue credits in BCCR")
