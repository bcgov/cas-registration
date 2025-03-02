from typing import Optional
from registration.schema.validators import validate_cra_business_number
from ninja import Schema, Field
from pydantic import field_validator
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure
from registration.schema.v2.business_structure import validate_business_structure


class ParentOperatorIn(Schema):
    """
    Schema for the Parent Operator part of the user operator form
    """

    po_legal_name: str
    po_trade_name: Optional[str] = ""
    po_cra_business_number: int
    po_bc_corporate_registry_number: str = Field(pattern=BC_CORPORATE_REGISTRY_REGEX)
    po_business_structure: str
    po_website: Optional[
        str
    ] = ""  # This is a URLField in the model, but we don't need to validate it here if not passed in
    po_physical_street_address: str
    po_physical_municipality: str
    po_physical_province: str
    po_physical_postal_code: str
    po_mailing_address_same_as_physical: bool
    # below are optional fields because we might use physical address as mailing address
    po_mailing_street_address: Optional[str] = None
    po_mailing_municipality: Optional[str] = None
    po_mailing_province: Optional[str] = None
    po_mailing_postal_code: Optional[str] = None
    operator_index: Optional[int] = None

    @field_validator("po_business_structure")
    @classmethod
    def validate_po_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)

    @field_validator("po_cra_business_number")
    @classmethod
    def validate_cra_business_number(cls, value: int) -> Optional[int]:
        return validate_cra_business_number(value)



