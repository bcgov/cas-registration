from typing import Optional
from registration.models.business_structure import BusinessStructure
from registration.schema.v1.business_structure import validate_business_structure
from registration.schema.validators import validate_cra_business_number
from ninja import Field, ModelSchema
from common.constants import AUDIT_FIELDS
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

    mo_legal_name: str = Field(..., alias="legal_name")
    mo_trade_name: str = Field(..., alias="trade_name")
    mo_cra_business_number: int = Field(..., alias="cra_business_number")
    mo_bc_corporate_registry_number: str = Field(
        ..., alias="bc_corporate_registry_number", pattern=BC_CORPORATE_REGISTRY_REGEX
    )
    mo_business_structure: str = Field(..., alias="business_structure")
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
    def resolve_business_structure(mo: MultipleOperator) -> str:
        return mo.business_structure.name  # type: ignore # we know that business_structure is not None

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
        ]
