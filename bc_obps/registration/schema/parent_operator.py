from typing import Optional
from ninja import ModelSchema, Schema, Field
from pydantic import validator
from registration.constants import AUDIT_FIELDS, BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure, ParentOperator
from .business_structure import validate_business_structure


class ParentOperatorIn(Schema):
    """
    Schema for the Parent Operator part of the user operator form
    """

    po_legal_name: str
    po_trade_name: Optional[str] = ""
    po_cra_business_number: int
    po_bc_corporate_registry_number: str = Field(regex=BC_CORPORATE_REGISTRY_REGEX)
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
    po_mailing_street_address: Optional[str]
    po_mailing_municipality: Optional[str]
    po_mailing_province: Optional[str]
    po_mailing_postal_code: Optional[str]

    @validator("po_business_structure")
    @classmethod
    def validate_po_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)


class ParentOperatorOut(ModelSchema):
    """
    Schema for the Parent Operator part of the user operator form
    """

    po_legal_name: str = Field(..., alias="legal_name")
    po_trade_name: Optional[str] = Field("", alias="trade_name")
    po_cra_business_number: int = Field(..., alias="cra_business_number")
    po_bc_corporate_registry_number: str = Field(..., alias="bc_corporate_registry_number")
    po_business_structure: str = Field(..., alias="business_structure.name")
    po_website: Optional[str] = Field("", alias="website")
    po_physical_street_address: str = Field(..., alias="physical_address.street_address")
    po_physical_municipality: str = Field(..., alias="physical_address.municipality")
    po_physical_province: str = Field(..., alias="physical_address.province")
    po_physical_postal_code: str = Field(..., alias="physical_address.postal_code")
    po_mailing_address_same_as_physical: bool
    po_mailing_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    po_mailing_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    po_mailing_province: Optional[str] = Field(None, alias="mailing_address.province")
    po_mailing_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")

    @staticmethod
    def resolve_po_mailing_address_same_as_physical(obj: ParentOperator) -> bool:
        return obj.mailing_address.id == obj.physical_address.id

    class Config:
        model = ParentOperator
        model_exclude = [*AUDIT_FIELDS, "id", "child_operator"]
