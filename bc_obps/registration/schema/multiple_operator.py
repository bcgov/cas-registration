from typing import Optional
from ninja import Field, ModelSchema
from registration.models import MultipleOperator
from registration.utils import AUDIT_FIELDS


class MultipleOperatorOut(ModelSchema):
    """
    Schema for the MultipleOperator model
    """

    mo_legal_name: str = Field(..., alias="legal_name")
    mo_trade_name: str = Field(..., alias="trade_name")
    mo_cra_business_number: int = Field(..., alias="cra_business_number")
    mo_bc_corporate_registry_number: str = Field(
        ..., alias="bc_corporate_registry_number", regex=r"^[A-Za-z]{1,3}\d{7}$"
    )
    mo_business_structure: str = Field(..., alias="business_structure")
    mo_website: Optional[str] = Field(None, alias="website")
    mo_percentage_ownership: float = Field(None, alias="percentage_ownership")
    mo_physical_street_address: str = Field(..., alias="physical_address.street_address")
    mo_physical_municipality: str = Field(..., alias="physical_address.municipality")
    mo_physical_province: str = Field(..., alias="physical_address.province")
    mo_physical_postal_code: str = Field(..., alias="physical_address.postal_code")
    mo_mailing_address_same_as_physical: Optional[bool] = Field(False, alias="mailing_address_same_as_physical")
    mo_mailing_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    mo_mailing_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    mo_mailing_province: Optional[str] = Field(None, alias="mailing_address.province")
    mo_mailing_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")

    @staticmethod
    def resolve_business_structure(mo: MultipleOperator):
        return mo.business_structure.name

    class Config:
        model = MultipleOperator
        model_exclude = [
            *AUDIT_FIELDS,
            # exclude the following fields since they are handled by the aliases above
            "legal_name",
            "trade_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "physical_address",
            "mailing_address",
            "percentage_ownership",
            "website",
        ]
