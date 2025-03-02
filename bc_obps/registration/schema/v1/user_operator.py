from typing import List, Optional
from uuid import UUID
from registration.schema.validators import validate_cra_business_number
from registration.schema.v2.operator import OperatorExternalDashboardUsersTileData
from registration.schema.v2.user import UserExternalDashboardUsersTileData
from ninja import ModelSchema, Schema, Field
from pydantic import field_validator
from common.constants import AUDIT_FIELDS
from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure, Contact, UserOperator
from .parent_operator import ParentOperatorIn, ParentOperatorOut
from registration.schema.v2.business_structure import validate_business_structure


class PendingUserOperatorOut(ModelSchema):
    is_new: bool = Field(..., alias="operator.is_new")
    operatorId: UUID = Field(..., alias="operator.id")
    operatorStatus: str = Field(..., alias="operator.status")
    operatorLegalName: str = Field(..., alias="operator.legal_name")

    class Meta:
        model = UserOperator
        fields = ["id", "status"]


class UserOperatorStatusUpdate(ModelSchema):
    role: Optional[str] = None

    class Meta:
        model = UserOperator
        fields = ["status"]


class IsApprovedUserOperator(Schema):
    approved: bool


class UserOperatorIdOut(Schema):
    user_operator_id: UUID


class RequestAccessOut(Schema):
    user_operator_id: UUID
    operator_id: UUID


class UserOperatorOut(ModelSchema):
    """
    Custom schema for the user operator form
    """

    operator_status: str = Field(..., alias="operator.status")
    legal_name: str = Field(..., alias="operator.legal_name")
    trade_name: Optional[str] = Field("", alias="operator.trade_name")
    cra_business_number: Optional[int] = Field(None, alias="operator.cra_business_number")
    bc_corporate_registry_number: Optional[str] = Field(
        None, pattern=BC_CORPORATE_REGISTRY_REGEX, alias="operator.bc_corporate_registry_number"
    )
    business_structure: Optional[str] = Field(None, alias="operator.business_structure.name")
    physical_street_address: Optional[str] = Field(None, alias="operator.physical_address.street_address")
    physical_municipality: Optional[str] = Field(None, alias="operator.physical_address.municipality")
    physical_province: Optional[str] = Field(None, alias="operator.physical_address.province")
    physical_postal_code: Optional[str] = Field(None, alias="operator.physical_address.postal_code")
    mailing_street_address: Optional[str] = Field(None, alias="operator.mailing_address.street_address")
    mailing_municipality: Optional[str] = Field(None, alias="operator.mailing_address.municipality")
    mailing_province: Optional[str] = Field(None, alias="operator.mailing_address.province")
    mailing_postal_code: Optional[str] = Field(None, alias="operator.mailing_address.postal_code")
    website: Optional[str] = Field("", alias="operator.website")
    mailing_address_same_as_physical: bool
    operator_id: UUID = Field(..., alias="operator.id")
    is_new: bool = Field(..., alias="operator.is_new")
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = Field(None, alias="operator.parent_operators")
    first_name: str = Field(..., alias="user.first_name")
    last_name: str = Field(..., alias="user.last_name")
    email: str = Field(..., alias="user.email")
    phone_number: str = str(Field(None, alias="user.phone_number"))
    position_title: str = Field(..., alias="user.position_title")
    bceid_business_name: Optional[str] = Field(None, alias="user.bceid_business_name")

    @staticmethod
    def resolve_mailing_address_same_as_physical(obj: UserOperator) -> bool:
        if not obj.operator.mailing_address or not obj.operator.physical_address:
            return False
        return obj.operator.mailing_address.id == obj.operator.physical_address.id

    @staticmethod
    def resolve_operator_has_parent_operators(obj: UserOperator) -> bool:
        return obj.operator.parent_operators.exists()

    @staticmethod
    def resolve_phone_number(obj: UserOperator) -> str:
        return str(obj.user.phone_number)

    class Meta:
        model = UserOperator
        fields = ["role", "status"]


class UserOperatorOperatorIn(Schema):
    """
    Schema for the Operator Information part of the user operator form
    """

    legal_name: str
    trade_name: Optional[str] = ""
    cra_business_number: int
    bc_corporate_registry_number: str = Field(pattern=BC_CORPORATE_REGISTRY_REGEX)
    business_structure: str
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    # below are optional fields because we might use physical address as mailing address
    mailing_street_address: Optional[str] = None
    mailing_municipality: Optional[str] = None
    mailing_province: Optional[str] = None
    mailing_postal_code: Optional[str] = None
    website: Optional[str] = ""
    mailing_address_same_as_physical: bool
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorIn]] = None

    @field_validator("business_structure")
    @classmethod
    def validate_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)

    @field_validator("cra_business_number")
    @classmethod
    def validate_cra_business_number(cls, value: int) -> Optional[int]:
        return validate_cra_business_number(value)


class UserOperatorContactIn(ModelSchema):
    """
    Schema for the User Information part of the user operator form
    """

    is_senior_officer: bool
    so_phone_number: Optional[str] = None
    so_email: Optional[str] = None
    street_address: str = Field(..., alias="address.street_address")
    municipality: str = Field(..., alias="address.municipality")
    province: str = Field(..., alias="address.province")
    postal_code: str = Field(..., alias="address.postal_code")
    # these fields are optional because we might use the user's info as the contact info
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    user_operator_id: UUID

    class Meta:
        model = Contact
        exclude = ["id", "business_role", "address", "email", "phone_number", *AUDIT_FIELDS]
        # whether an aliased field may be populated by its name as given by the model attribute, as well as the alias
        populate_by_name = True


class ExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for the data that will be shown in an industry_user's User Access Management tile.
    """

    user: UserExternalDashboardUsersTileData
    operator: OperatorExternalDashboardUsersTileData

    class Meta:
        model = UserOperator
        fields = ["role", "status", "id", "user_friendly_id"]


class UserOperatorListOut(Schema):
    id: UUID
    user_friendly_id: int
    status: str
    first_name: str
    last_name: str
    email: str
    legal_name: str
    bceid_business_name: str


class UserOperatorPaginatedOut(Schema):
    data: List[UserOperatorListOut]
    row_count: int


class UserOperatorUsersOut(Schema):
    id: UUID = Field(..., alias="user.pk")
    full_name: str

    @staticmethod
    def resolve_full_name(obj: UserOperator) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"
