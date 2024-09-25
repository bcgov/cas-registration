from typing import Optional
from ninja import Field, ModelSchema
from registration.models import MultipleOperator


class MultipleOperatorOut(ModelSchema):
    """
    Schema for the MultipleOperator model
    """

    mo_is_extraprovincial_company: bool
    mo_legal_name: str = Field(..., alias="legal_name")
    mo_trade_name: str = Field(..., alias="trade_name")
    mo_cra_business_number: int = Field(..., alias="cra_business_number")
    mo_bc_corporate_registry_number: Optional[str] = Field(None, alias="bc_corporate_registry_number")
    mo_business_structure: str = Field(..., alias="business_structure")
    mo_attorney_street_address: Optional[str] = Field(None, alias="attorney_address.street_address")
    mo_municipality: Optional[str] = Field(None, alias="attorney_address.municipality")
    mo_province: Optional[str] = Field(None, alias="attorney_address.province")
    mo_postal_code: Optional[str] = Field(None, alias="attorney_address.postal_code")

    @staticmethod
    def resolve_business_structure(mo: MultipleOperator) -> str:
        return mo.business_structure.name  # type: ignore # we know that business_structure is not None

    @staticmethod
    def resolve_mo_is_extraprovincial_company(mo: MultipleOperator) -> bool:
        return mo.bc_corporate_registry_number is not None

    class Meta:
        model = MultipleOperator
        fields = ["id"]
