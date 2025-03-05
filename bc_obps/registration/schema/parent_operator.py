from typing import Optional
from registration.schema import validate_cra_business_number
from ninja import ModelSchema, Field
from pydantic import field_validator
from registration.models import ParentOperator


class ParentOperatorIn(ModelSchema):
    """
    Schema for the Parent Operator part of the user operator form
    """

    id: Optional[int] = None
    legal_name: str = Field(..., alias="po_legal_name")
    # the following are optional because international operators don't have them
    cra_business_number: Optional[int] = Field(None, alias="po_cra_business_number")
    street_address: Optional[str] = Field(None, alias="po_street_address")
    municipality: Optional[str] = Field(None, alias="po_municipality")
    province: Optional[str] = Field(None, alias="po_province")
    postal_code: Optional[str] = Field(None, alias="po_postal_code")
    mailing_address: Optional[int] = Field(None, alias="po_mailing_address")
    # the following are optional because Canadian operators don't have them
    foreign_address: Optional[str] = None
    foreign_tax_id_number: Optional[str] = None

    @field_validator("cra_business_number")
    @classmethod
    def validate_cra_business_number(cls, value: int) -> Optional[int]:
        return validate_cra_business_number(value)

    class Meta:
        model = ParentOperator
        fields = ["id"]
        populate_by_name = True


class ParentOperatorOutV1(ModelSchema):
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
        return obj.mailing_address_id == obj.physical_address_id

    class Meta:
        model = ParentOperator
        fields = ["operator_index"]


class ParentOperatorOut(ModelSchema):
    """
    Schema for the Parent Operator part of the user operator form
    """

    po_legal_name: str = Field(..., alias="legal_name")
    # the following are optional because international operators don't have them
    po_cra_business_number: Optional[int] = Field(..., alias="cra_business_number")
    po_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    po_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    po_province: Optional[str] = Field(None, alias="mailing_address.province")
    po_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")
    operator_registered_in_canada: bool
    po_mailing_address: Optional[int] = Field(None, alias="mailing_address.id")
    # the following are optional because Canadian operators don't have them
    foreign_address: Optional[str] = None
    foreign_tax_id_number: Optional[str] = None

    @staticmethod
    def resolve_operator_registered_in_canada(obj: ParentOperator) -> bool:
        return not obj.foreign_tax_id_number

    class Meta:
        model = ParentOperator
        fields = ["id"]
        populate_by_name = True
