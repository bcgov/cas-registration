from typing import Annotated

from ninja import Field, FilterSchema, ModelSchema, Schema
from pydantic import field_validator
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    CRA_BUSINESS_NUMBER_REGEX,
)
from registration.models import BusinessStructure, Operator, ParentOperator
from registration.models.partner_operator import PartnerOperator
from registration.schema import (
    ParentOperatorIn,
    ParentOperatorOut,
    PartnerOperatorIn,
    PartnerOperatorOut,
    validate_business_structure,
    validate_cra_business_number,
)


class OperatorFilterSchema(FilterSchema):
    legal_name: Annotated[str | None, Field(q="legal_name__icontains")] = None
    business_structure: Annotated[
        str | None, Field(q="business_structure_id__name__icontains")
    ] = None
    cra_business_number: Annotated[
        str | None, Field(q="cra_business_number__icontains")
    ] = None
    bc_corporate_registry_number: Annotated[
        str | None, Field(q="bc_corporate_registry_number__icontains")
    ] = None


mailing_address_alias = {
    "street_address": "mailing_address.street_address",
    "municipality": "mailing_address.municipality",
    "province": "mailing_address.province",
    "postal_code": "mailing_address.postal_code",
}

physical_address_alias = {
    "street_address": "physical_address.street_address",
    "municipality": "physical_address.municipality",
    "province": "physical_address.province",
    "postal_code": "physical_address.postal_code",
}


class OperatorOut(ModelSchema):
    """
    Custom schema for the operator form
    """

    trade_name: str | None = ""
    street_address: str = Field("", alias=mailing_address_alias["street_address"])
    municipality: str = Field("", alias=mailing_address_alias["municipality"])
    province: str = Field("", alias=mailing_address_alias["province"])
    postal_code: str = Field("", alias=mailing_address_alias["postal_code"])
    operator_has_parent_operators: bool  # we don't have this field for partner operators because it depends on business structure
    parent_operators_array: list[ParentOperatorOut] | None = None
    partner_operators_array: list[PartnerOperatorOut] | None = None

    @staticmethod
    def resolve_parent_operators_array(obj: Operator) -> list[ParentOperator] | None:
        if obj.parent_operators.exists():
            return [
                parent_operator
                for parent_operator in obj.parent_operators.select_related(
                    "mailing_address"
                )
            ]
        return None

    @staticmethod
    def resolve_operator_has_parent_operators(obj: Operator) -> bool:
        return obj.parent_operators.exists()

    @staticmethod
    def resolve_partner_operators_array(
        obj: Operator,
    ) -> list[PartnerOperator] | None:
        if obj.partner_operators.exists():
            return [
                partner_operator
                for partner_operator in obj.partner_operators.select_related(
                    "business_structure"
                )
            ]
        return None

    class Meta:
        model = Operator
        fields = [
            "id",
            "legal_name",
            "trade_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
            "mailing_address",
        ]


class OperatorListOut(ModelSchema):
    class Meta:
        model = Operator
        fields = [
            "id",
            "legal_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
        ]
        from_attributes = True


class OperatorPaginatedOut(Schema):
    data: list[OperatorListOut]
    row_count: int


class OperatorIn(ModelSchema):
    """
    Schema for the user operator form
    """

    trade_name: str | None = ""
    business_structure: str
    cra_business_number: str = Field(..., pattern=CRA_BUSINESS_NUMBER_REGEX)
    bc_corporate_registry_number: str = Field(pattern=BC_CORPORATE_REGISTRY_REGEX)
    parent_operators_array: list[ParentOperatorIn] | None = None
    partner_operators_array: list[PartnerOperatorIn] | None = None
    mailing_address: int | None = None
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
    def validate_cra_business_number(cls, value: str) -> str | None:
        return validate_cra_business_number(value)

    class Meta:
        model = Operator
        fields = [
            "legal_name",
            "trade_name",
            "business_structure",
            "cra_business_number",
            "bc_corporate_registry_number",
            "mailing_address",
        ]


class ConfirmSelectedOperatorOut(ModelSchema):
    street_address: str = Field("", alias=mailing_address_alias["street_address"])

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

    physical_street_address: str | None = Field(
        None, alias=physical_address_alias["street_address"]
    )
    physical_municipality: str | None = Field(
        None, alias=physical_address_alias["municipality"]
    )
    physical_province: str | None = Field(
        None, alias=physical_address_alias["province"]
    )
    physical_postal_code: str | None = Field(
        None, alias=physical_address_alias["postal_code"]
    )
    mailing_street_address: str | None = Field(
        None, alias=mailing_address_alias["street_address"]
    )
    mailing_municipality: str | None = Field(
        None, alias=mailing_address_alias["municipality"]
    )
    mailing_province: str | None = Field(None, alias=mailing_address_alias["province"])
    mailing_postal_code: str | None = Field(
        None, alias=mailing_address_alias["postal_code"]
    )
    mailing_address_same_as_physical: bool
    operator_has_parent_operators: bool
    parent_operators_array: list[ParentOperatorOut] | None = None

    @staticmethod
    def resolve_parent_operators_array(obj: Operator) -> list[ParentOperator] | None:
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
