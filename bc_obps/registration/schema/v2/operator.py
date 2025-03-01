from typing import List, Optional
from registration.models.partner_operator import PartnerOperator
from registration.schema.v2.partner_operator import PartnerOperatorIn, PartnerOperatorOut
from registration.models.parent_operator import ParentOperator
from registration.schema.v2.parent_operator import ParentOperatorIn, ParentOperatorOut
from registration.models.operator import Operator
from registration.schema.v2.business_structure import validate_business_structure
from registration.schema.validators import validate_cra_business_number
from ninja import ModelSchema, FilterSchema, Field, Schema
from pydantic import field_validator
from registration.models import BusinessStructure, Operator
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
)


class OperatorFilterSchema(FilterSchema):
    legal_name: Optional[str] = Field(None, json_schema_extra={'q': 'legal_name__icontains'})
    business_structure: Optional[str] = Field(None, json_schema_extra={'q': 'business_structure_id__name__icontains'})
    cra_business_number: Optional[str] = Field(None, json_schema_extra={'q': 'cra_business_number__icontains'})
    bc_corporate_registry_number: Optional[str] = Field(
        None, json_schema_extra={'q': 'bc_corporate_registry_number__icontains'}
    )


class OperatorOut(ModelSchema):
    """
    Custom schema for the operator form
    """

    trade_name: Optional[str] = ''
    street_address: str = Field('', alias="mailing_address.street_address")
    municipality: str = Field('', alias="mailing_address.municipality")
    province: str = Field('', alias="mailing_address.province")
    postal_code: str = Field('', alias="mailing_address.postal_code")
    operator_has_parent_operators: (
        bool  # we don't have this field for partner operators because it depends on business structure
    )
    parent_operators_array: Optional[List[ParentOperatorOut]] = None
    partner_operators_array: Optional[List[PartnerOperatorOut]] = None

    @staticmethod
    def resolve_parent_operators_array(obj: Operator) -> Optional[List[ParentOperator]]:
        if obj.parent_operators.exists():
            return [parent_operator for parent_operator in obj.parent_operators.select_related("mailing_address")]
        return None

    @staticmethod
    def resolve_operator_has_parent_operators(obj: Operator) -> bool:
        return obj.parent_operators.exists()

    @staticmethod
    def resolve_partner_operators_array(obj: Operator) -> Optional[List[PartnerOperator]]:
        if obj.partner_operators.exists():
            return [partner_operator for partner_operator in obj.partner_operators.select_related("business_structure")]
        return None

    class Meta:
        model = Operator
        fields = [
            'id',
            'legal_name',
            'trade_name',
            'business_structure',
            'cra_business_number',
            'bc_corporate_registry_number',
            'mailing_address',
        ]


class OperatorListOut(ModelSchema):
    class Meta:
        model = Operator
        fields = [
            'id',
            'legal_name',
            'business_structure',
            'cra_business_number',
            'bc_corporate_registry_number',
        ]
        from_attributes = True


class OperatorPaginatedOut(Schema):
    data: List[OperatorListOut]
    row_count: int


class OperatorIn(ModelSchema):
    """
    Schema for the user operator form
    """

    trade_name: Optional[str] = ''
    business_structure: str
    cra_business_number: int
    bc_corporate_registry_number: str = Field(pattern=BC_CORPORATE_REGISTRY_REGEX)
    parent_operators_array: Optional[List[ParentOperatorIn]] = None
    partner_operators_array: Optional[List[PartnerOperatorIn]] = None
    mailing_address: Optional[int] = None
    street_address: str
    municipality: str
    province: str
    postal_code: str

    @field_validator("business_structure")
    @classmethod
    def validate_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)

    @field_validator("cra_business_number")
    @classmethod
    def validate_cra_business_number(cls, value: int) -> Optional[int]:
        return validate_cra_business_number(value)

    class Meta:
        model = Operator
        fields = [
            'legal_name',
            'trade_name',
            'business_structure',
            'cra_business_number',
            'bc_corporate_registry_number',
            'mailing_address',
        ]


class ConfirmSelectedOperatorOut(ModelSchema):
    street_address: str = Field('', alias="mailing_address.street_address")

    class Meta:
        model = Operator
        fields = ["id", "legal_name", "trade_name", "cra_business_number"]


class OperatorSearchOut(ModelSchema):
    class Meta:
        model = Operator
        fields = ["id", "legal_name"]
        from_attributes = True
