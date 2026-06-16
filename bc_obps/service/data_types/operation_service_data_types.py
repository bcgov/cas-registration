from dataclasses import dataclass
from typing import List, Optional

from django.core.files.uploadedfile import UploadedFile
from registration.models.operation import Operation


@dataclass
class MultipleOperatorData:
    legal_name: str
    trade_name: str
    business_structure: str
    cra_business_number: str

    id: Optional[int] = None
    bc_corporate_registry_number: Optional[str] = None
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None


@dataclass(kw_only=True)  # Allowing for extension with required fields
class OperationData:
    name: str
    type: str
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    naics_code_id: Optional[int] = None
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorData]] = None
    date_of_first_shipment: Optional[str] = None

    # Attachments
    boundary_map: Optional[UploadedFile] = None
    process_flow_diagram: Optional[UploadedFile] = None
    new_entrant_application: Optional[UploadedFile] = None

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
    operation_representatives: List[int]


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
    final_reporting_year: Optional[int] = None
