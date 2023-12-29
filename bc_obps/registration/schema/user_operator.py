from typing import Optional
import uuid
from django.forms import UUIDField
from ninja import ModelSchema, Schema, Field
from registration.models import Contact, User, UserOperator
from pydantic import Field
from ninja import ModelSchema, Schema, Field


class UserOperatorStatus(Schema):
    status: UserOperator.Statuses


class IsApprovedUserOperator(Schema):
    approved: bool


class UserOperatorOperatorIdOut(Schema):
    operator_id: int


class RequestAccessOut(Schema):
    user_operator_id: int


class UserOperatorOut(Schema):
    """
    Custom schema for the user operator form
    """

    first_name: str
    last_name: str
    position_title: str
    street_address: str
    municipality: str
    postal_code: str
    email: str
    phone_number: str
    province: str
    legal_name: str
    trade_name: Optional[str]
    cra_business_number: Optional[int]
    bc_corporate_registry_number: Optional[str] = Field(regex=r"^[A-Za-z]{1,3}\d{7}$")
    business_structure: str
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    # below are optional fields because we might use physical address as mailing address
    mailing_street_address: Optional[str]
    mailing_municipality: Optional[str]
    mailing_province: Optional[str]
    mailing_postal_code: Optional[str]
    website: Optional[str]
    status: str
    user_operator_status: str
    role: str


class UserOperatorOperatorIn(Schema):
    """
    Schema for the Operator Information part of the user operator form
    """

    legal_name: str
    trade_name: Optional[str] = ""
    cra_business_number: int
    bc_corporate_registry_number: str = Field(regex=r"^[A-Za-z]{1,3}\d{7}$")
    business_structure: str
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    # below are optional fields because we might use physical address as mailing address
    mailing_street_address: Optional[str]
    mailing_municipality: Optional[str]
    mailing_province: Optional[str]
    mailing_postal_code: Optional[str]
    website: Optional[str]
    mailing_address_same_as_physical: bool
    operator_has_parent_company: bool
    # pc => parent company
    pc_legal_name: Optional[str]
    pc_cra_business_number: Optional[int]
    pc_bc_corporate_registry_number: Optional[str] = Field(regex=r"^[A-Za-z]{1,3}\d{7}$")
    pc_business_structure: Optional[str]
    pc_physical_street_address: Optional[str]
    pc_physical_municipality: Optional[str]
    pc_physical_province: Optional[str]
    pc_physical_postal_code: Optional[str]
    pc_mailing_address_same_as_physical: Optional[bool]
    pc_mailing_street_address: Optional[str]
    pc_mailing_municipality: Optional[str]
    pc_mailing_province: Optional[str]
    pc_mailing_postal_code: Optional[str]
    percentage_owned_by_parent_company: Optional[int]


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
        model_exclude = ["id", "documents", "business_role", "address", *AUDIT_FIELDS]
        # whether an aliased field may be populated by its name as given by the model attribute, as well as the alias
        allow_population_by_field_name = True


class UserOperatorUserOut(ModelSchema):
    """
    Custom schema for the user operator user form
    """

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.phone_number:
            return
        return str(obj.phone_number)

    class Config:
        model = User
        model_fields = ["phone_number", "email"]


class SelectUserOperatorStatus(Schema):
    """
    Schema for a User Operator model
    """

    first_name: str = Field(..., alias="user.first_name")
    last_name: str = Field(..., alias="user.last_name")
    email: str = Field(..., alias="user.email")
    position_title: str = Field(..., alias="user.position_title")
    business_name: str = Field(..., alias="operator.legal_name")
    user_id: uuid.UUID = Field(..., alias="user.user_guid")
    role: str
    status: str


class SelectUserOperatorOperatorsOut(ModelSchema):
    """
    Schema for returning User's Business Operator
    """

    class Config:
        model = UserOperator
        model_fields = ["operator"]


class UserOperatorListOut(Schema):
    id: int
    status: str
    first_name: str
    last_name: str
    email: str
    legal_name: str
