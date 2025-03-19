from typing import List, Optional
from uuid import UUID
from registration.models.partner_operator import PartnerOperator
from registration.schema import (
    PartnerOperatorIn,
    PartnerOperatorOut,
    ParentOperatorIn,
    ParentOperatorOut,
    validate_business_structure,
    validate_cra_business_number,
)
from ninja import ModelSchema, FilterSchema, Schema
from pydantic import field_validator, Field
from registration.models import BusinessStructure, Operator, ParentOperator
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


class OperatorForOperationOut(ModelSchema):
    """
    Schema specifically for the operator field in the OperationOut schema
    This is used to optimize the queries and reduce the number of queries
    """

    physical_street_address: Optional[str] = Field(None, alias="physical_address.street_address")
    physical_municipality: Optional[str] = Field(None, alias="physical_address.municipality")
    physical_province: Optional[str] = Field(None, alias="physical_address.province")
    physical_postal_code: Optional[str] = Field(None, alias="physical_address.postal_code")
    mailing_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    mailing_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    mailing_province: Optional[str] = Field(None, alias="mailing_address.province")
    mailing_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")
    mailing_address_same_as_physical: bool
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = None

    @staticmethod
    def resolve_parent_operators_array(obj: Operator) -> Optional[List[ParentOperator]]:
        if obj.parent_operators.exists():
            return [
                parent_operator
                for parent_operator in obj.parent_operators.select_related(
                    "physical_address", "mailing_address", "business_structure"
                )
            ]
        return None

    @staticmethod
    def resolve_mailing_address_same_as_physical(obj: Operator) -> bool:
        if not obj.mailing_address or not obj.physical_address:
            return False
        return obj.mailing_address_id == obj.physical_address_id

    @staticmethod
    def resolve_operator_has_parent_operators(obj: Operator) -> bool:
        return obj.parent_operators.exists()

    class Meta:
        model = Operator
        fields = [
            "id",
            "legal_name",
            "trade_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "website",
        ]


class OperatorExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the Operator model that are needed in ExternalDashboardUsersTileData
    """

    class Meta:
        model = Operator
        fields = ["legal_name"]