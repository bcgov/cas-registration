from typing import Optional
from registration.models.business_structure import BusinessStructure
from registration.schema.v2.business_structure import validate_business_structure
from registration.schema.validators import validate_cra_business_number
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
