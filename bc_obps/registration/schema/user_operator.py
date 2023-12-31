from typing import Optional
import uuid
from ninja import ModelSchema, Schema, Field
from registration.models import Contact, User, UserOperator
from registration.utils import AUDIT_FIELDS


class UserOperatorStatus(Schema):
    status: UserOperator.Statuses


class IsApprovedUserOperator(Schema):
    approved: bool


class UserOperatorOperatorIdOut(Schema):
    operator_id: int


class RequestAccessOut(Schema):
    user_operator_id: int


class UserOperatorOut(ModelSchema):
    """
    Custom schema for the user operator form
    """

    first_name: str
    last_name: str
    position_title: str
    street_address: str
    municipality: str
    postal_code: str
    province: str
    email: str = Field(..., alias="user.email")
    phone_number: str
    so_email: str
    so_phone_number: str
    legal_name: str = Field(..., alias="operator.legal_name")
    trade_name: Optional[str] = Field("", alias="operator.trade_name")
    cra_business_number: Optional[int] = Field(None, alias="operator.cra_business_number")
    bc_corporate_registry_number: str = Field(
        ..., regex=r"^[A-Za-z]{1,3}\d{7}$", alias="operator.bc_corporate_registry_number"
    )
    business_structure: str = Field(..., alias="operator.business_structure.name")
    physical_street_address: str = Field(..., alias="operator.physical_address.street_address")
    physical_municipality: str = Field(..., alias="operator.physical_address.municipality")
    physical_province: str = Field(..., alias="operator.physical_address.province")
    physical_postal_code: str = Field(..., alias="operator.physical_address.postal_code")
    mailing_street_address: str = Field(..., alias="operator.mailing_address.street_address")
    mailing_municipality: str = Field(..., alias="operator.mailing_address.municipality")
    mailing_province: str = Field(..., alias="operator.mailing_address.province")
    mailing_postal_code: str = Field(..., alias="operator.mailing_address.postal_code")
    website: Optional[str] = Field("", alias="operator.website")
    is_senior_officer: bool
    mailing_address_same_as_physical: bool

    @staticmethod
    def resolve_is_senior_officer(obj: UserOperator):
        return obj.user_is_senior_officer()

    @staticmethod
    def resolve_mailing_address_same_as_physical(obj: UserOperator):
        return obj.operator.mailing_address.id == obj.operator.physical_address.id

    @staticmethod
    def resolve_first_name(obj: UserOperator):
        return obj.get_senior_officer().first_name if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_last_name(obj: UserOperator):
        return obj.get_senior_officer().last_name if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_position_title(obj: UserOperator):
        return obj.get_senior_officer().position_title if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_street_address(obj: UserOperator):
        return obj.get_senior_officer().address.street_address if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_municipality(obj: UserOperator):
        return obj.get_senior_officer().address.municipality if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_postal_code(obj: UserOperator):
        return obj.get_senior_officer().address.postal_code if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_province(obj: UserOperator):
        return obj.get_senior_officer().address.province if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_so_email(obj: UserOperator):
        return obj.get_senior_officer().email if obj.get_senior_officer() else ""

    @staticmethod
    def resolve_phone_number(obj: UserOperator):
        return str(obj.user.phone_number) if obj.user.phone_number else ""

    @staticmethod
    def resolve_so_phone_number(obj: UserOperator):
        return str(obj.get_senior_officer().phone_number) if obj.get_senior_officer() else ""

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
