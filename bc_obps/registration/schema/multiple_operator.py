from typing import Optional
from ninja import Field, Schema
from registration.models import MultipleOperator


### Multiple Operator schemas


class MultipleOperatorIn(Schema):
    operation_id: int
    mo_legal_name: str
    mo_trade_name: str
    mo_cra_business_number: int
    mo_bc_corporate_registry_number: str
    mo_business_structure: str
    mo_website: Optional[str]
    mo_physical_street_address: str
    mo_physical_municipality: str
    mo_physical_province: str
    mo_physical_postal_code: str
    mo_mailing_address_same_as_physical: Optional[bool] = False
    mo_mailing_street_address: Optional[str]
    mo_mailing_municipality: Optional[str]
    mo_mailing_province: Optional[str]
    mo_mailing_postal_code: Optional[str]


class MultipleOperatorOut(Schema):
    """
    Schema for the MultipleOperator model
    """

    mo_legal_name: str = Field(..., alias="legal_name")
    mo_trade_name: str = Field(..., alias="trade_name")
    mo_cra_business_number: int = Field(..., alias="cra_business_number")
    mo_bc_corporate_registry_number: str = Field(..., alias="bc_corporate_registry_number")
    mo_business_structure: str = Field(..., alias="business_structure")
    mo_website: Optional[str] = Field(None, alias="website")
    mo_percentage_ownership: int = Field(None, alias="percentage_ownership")
    mo_physical_street_address: str = Field(..., alias="physical_street_address")
    mo_physical_municipality: str = Field(..., alias="physical_municipality")
    mo_physical_province: str = Field(..., alias="physical_province")
    mo_physical_postal_code: str = Field(..., alias="physical_postal_code")
    mo_mailing_address_same_as_physical: Optional[bool] = Field(False, alias="mailing_address_same_as_physical")
    mo_mailing_street_address: Optional[str] = Field(None, alias="mailing_street_address")
    mo_mailing_municipality: Optional[str] = Field(None, alias="mailing_municipality")
    mo_mailing_province: Optional[str] = Field(None, alias="mailing_province")
    mo_mailing_postal_code: Optional[str] = Field(None, alias="mailing_postal_code")

    @staticmethod
    def resolve_business_structure(mo: MultipleOperator):
        return mo.business_structure.name
