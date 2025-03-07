from typing import Optional
from registration.models.business_structure import BusinessStructure
from registration.schema import validate_business_structure, validate_cra_business_number
from ninja import Field, ModelSchema
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models import MultipleOperator
from pydantic import field_validator


class MultipleOperatorIn(ModelSchema):
    """
    Schema for the Multiple Operator part of the operation form
    """

    id: Optional[int] = None
    legal_name: str = Field(..., alias="mo_legal_name")
    trade_name: str = Field(..., alias="mo_trade_name")
    business_structure: str = Field(..., alias="mo_business_structure")
    cra_business_number: int = Field(..., alias="mo_cra_business_number")
    bc_corporate_registry_number: Optional[str] = Field(
        None, alias="mo_bc_corporate_registry_number", pattern=BC_CORPORATE_REGISTRY_REGEX
    )
    street_address: Optional[str] = Field(None, alias="mo_attorney_street_address")
    municipality: Optional[str] = Field(None, alias="mo_municipality")
    province: Optional[str] = Field(None, alias="mo_province")
    postal_code: Optional[str] = Field(None, alias="mo_postal_code")

    @field_validator("cra_business_number")
    @classmethod
    def validate_cra_business_number(cls, value: int) -> Optional[int]:
        return validate_cra_business_number(value)

    @field_validator("business_structure")
    @classmethod
    def validate_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)

    class Meta:
        model = MultipleOperator
        fields = ["id"]
        populate_by_name = True


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
        return mo.bc_corporate_registry_number is None

    class Meta:
        model = MultipleOperator
        fields = ["id"]
