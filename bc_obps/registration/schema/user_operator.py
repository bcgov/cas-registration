from typing import List, Optional
import uuid
from registration.schema.operator import OperatorExternalDashboardUsersTileData
from registration.schema.user import UserExternalDashboardUsersTileData
from ninja import ModelSchema, Schema, Field
from pydantic import validator
from registration.constants import AUDIT_FIELDS, BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure, Contact, UserOperator
from .parent_operator import ParentOperatorIn, ParentOperatorOut
from .business_structure import validate_business_structure


class PendingUserOperatorOut(ModelSchema):
    is_new: bool

    class Config:
        model = UserOperator
        model_exclude = [*AUDIT_FIELDS]


class UserOperatorStatusUpdate(ModelSchema):
    user_guid: Optional[uuid.UUID] = None
    user_operator_id: Optional[int] = None

    class Config:
        model = UserOperator
        model_fields = ["status"]


class IsApprovedUserOperator(Schema):
    approved: bool


class UserOperatorIdOut(Schema):
    user_operator_id: int


class RequestAccessOut(Schema):
    user_operator_id: int
    operator_id: int


class UserOperatorOut(ModelSchema):
    """
    Custom schema for the user operator form
    """

    operator_status: str = Field(..., alias="operator.status")
    legal_name: str = Field(..., alias="operator.legal_name")
    trade_name: Optional[str] = Field("", alias="operator.trade_name")
    cra_business_number: Optional[int] = Field(None, alias="operator.cra_business_number")
    bc_corporate_registry_number: Optional[str] = Field(
        None, regex=BC_CORPORATE_REGISTRY_REGEX, alias="operator.bc_corporate_registry_number"
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
    operator_id: int = Field(..., alias="operator.id")
    is_new: bool = Field(..., alias="operator.is_new")
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = Field(None, alias="operator.parent_operators")
    first_name: str = Field(..., alias="user.first_name")
    last_name: str = Field(..., alias="user.last_name")
    email: str = Field(..., alias="user.email")
    phone_number: str = str(Field(None, alias="user.phone_number"))
    position_title: str = Field(None, alias="user.position_title")
    bceid_business_name: Optional[str] = Field(None, alias="user.bceid_business_name")

    @staticmethod
    def resolve_mailing_address_same_as_physical(obj: UserOperator):
        if not obj.operator.mailing_address or not obj.operator.physical_address:
            return False
        return obj.operator.mailing_address.id == obj.operator.physical_address.id

    @staticmethod
    def resolve_operator_has_parent_operators(obj: UserOperator) -> bool:
        return obj.operator.parent_operators.exists()

    @staticmethod
    def resolve_phone_number(obj):
        return str(obj.user.phone_number)

    class Config:
        model = UserOperator
        model_fields = ["role", "status"]


class UserOperatorOperatorIn(Schema):
    """
    Schema for the Operator Information part of the user operator form
    """

    legal_name: str
    trade_name: Optional[str] = ""
    cra_business_number: int
    bc_corporate_registry_number: str = Field(regex=BC_CORPORATE_REGISTRY_REGEX)
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

    @validator("business_structure")
    @classmethod
    def validate_business_structure(cls, value: str) -> BusinessStructure:
        return validate_business_structure(value)


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
    user_operator_id: int

    class Config:
        model = Contact
        model_exclude = ["id", "documents", "business_role", "address", "email", "phone_number", *AUDIT_FIELDS]
        # whether an aliased field may be populated by its name as given by the model attribute, as well as the alias
        allow_population_by_field_name = True


class ExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for the data that will be shown in an industry_user's User Access Management tile.
    """

    user: UserExternalDashboardUsersTileData
    operator: OperatorExternalDashboardUsersTileData

    class Config:
        model = UserOperator
        model_fields = ["role", "status"]


class UserOperatorListOut(Schema):
    id: int
    status: str
    first_name: str
    last_name: str
    email: str
    legal_name: str


class UserOperatorPaginatedOut(Schema):
    data: List[UserOperatorListOut]
    row_count: int
