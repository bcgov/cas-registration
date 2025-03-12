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
