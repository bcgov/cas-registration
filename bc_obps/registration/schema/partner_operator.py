from typing import Optional
from registration.schema import validate_business_structure
from ninja import ModelSchema, Field
from pydantic import field_validator
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure, PartnerOperator


class PartnerOperatorIn(ModelSchema):
    """
    Schema for the Partner Operator part of the user operator form
    """

    legal_name: str = Field(..., alias="partner_legal_name")
    trade_name: Optional[str] = Field("", alias="partner_trade_name")
    cra_business_number: int = Field(..., alias="partner_cra_business_number")
    bc_corporate_registry_number: str = Field(
        ..., alias="partner_bc_corporate_registry_number", pattern=BC_CORPORATE_REGISTRY_REGEX
    )
    business_structure: str = Field(..., alias="partner_business_structure")

    @field_validator("business_structure")
    @classmethod
    def validate_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)

    class Meta:
        model = PartnerOperator
        fields = ["id"]
        populate_by_name = True


class PartnerOperatorOut(ModelSchema):
    """
    Schema for the Partner Operator part of the user operator form
    """

    partner_legal_name: str = Field(..., alias="legal_name")
    partner_trade_name: Optional[str] = Field("", alias="trade_name")
    partner_cra_business_number: int = Field(..., alias="cra_business_number")
    partner_bc_corporate_registry_number: str = Field(..., alias="bc_corporate_registry_number")
    partner_business_structure: str = Field(..., alias="business_structure.name")

    class Meta:
        model = PartnerOperator
        fields = ["id"]
        populate_by_name = True
