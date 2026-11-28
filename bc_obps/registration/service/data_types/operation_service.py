from dataclasses import dataclass

from django.core.files.uploadedfile import UploadedFile
from registration.models.operation import Operation


@dataclass
class MultipleOperatorData:
    legal_name: str
    trade_name: str
    business_structure_id: str
    cra_business_number: str

    id: int | None = None
    bc_corporate_registry_number: str | None = None
    street_address: str | None = None
    municipality: str | None = None
    province: str | None = None
    postal_code: str | None = None


@dataclass(kw_only=True)  # Allowing for extension with required fields
class OperationData:
    name: str
    type: str
    registration_purpose: Operation.Purposes | None = None
    regulated_products: list[int] | None = None
    activities: list[int] | None = None
    naics_code_id: int | None = None
    secondary_naics_code_id: int | None = None
    tertiary_naics_code_id: int | None = None
    multiple_operators_array: list[MultipleOperatorData] | None = None
    date_of_first_shipment: str | None = None

    # Attachments
    boundary_map: UploadedFile | None = None
    process_flow_diagram: UploadedFile | None = None
    new_entrant_application: UploadedFile | None = None

    def operation_fields(self) -> dict:
        return {
            "name": self.name,
            "type": self.type,
            "naics_code_id": self.naics_code_id,
            "secondary_naics_code_id": self.secondary_naics_code_id,
            "tertiary_naics_code_id": self.tertiary_naics_code_id,
            "date_of_first_shipment": self.date_of_first_shipment,
            "registration_purpose": self.registration_purpose,
        }


@dataclass
class UpdateOperationData(OperationData):
    operation_representatives: list[int]


@dataclass
class OptedInOperationDetailData:
    meets_section_3_emissions_requirements: bool
    meets_electricity_import_operation_criteria: bool
    meets_entire_operation_requirements: bool
    meets_section_6_emissions_requirements: bool
    meets_naics_code_11_22_562_classification_requirements: bool
    meets_producing_gger_schedule_a1_regulated_product: bool
    meets_reporting_and_regulated_obligations: bool
    meets_notification_to_director_on_criteria_change: bool
    final_reporting_year: int | None = None
