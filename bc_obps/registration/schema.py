from typing import Optional
from ninja import Field, Schema
from decimal import Decimal
from ninja import ModelSchema
from .models import Operator


# Generic schemas
class Message(Schema):
    message: str


# Naics code schemas and endpoints
class NaicsCodeSchema(Schema):
    id: int
    naics_code: str
    ciip_sector: str
    naics_description: str


# Operation schemas and endpoints
class OperationIn(Schema):
    operator: int = Field(..., alias="operator_id")
    name: str
    operation_type: str
    naics_code: int = Field(..., alias="naics_code_id")
    eligible_commercial_product_name: str
    permit_id: str
    npr_id: str
    ghfrp_id: str
    bcghrp_id: str
    petrinex_id: str
    latitude: Decimal
    longitude: Decimal
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: Decimal
    registered_for_obps: bool
    estimated_emissions: Decimal
    registered_for_obps: str = Field(default=False)
    # contacts:
    # documents:


class OperationOut(Schema):
    id: int
    operator_id: int = Field(..., alias="operator.id")
    name: str
    operation_type: str
    naics_code_id: int = Field(..., alias="naics_code.id")
    eligible_commercial_product_name: str
    permit_id: str
    npr_id: str
    ghfrp_id: str
    bcghrp_id: str
    petrinex_id: str
    latitude: Decimal
    longitude: Decimal
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: Decimal
    registered_for_obps: bool
    estimated_emissions: Decimal
    # contacts:
    # documents:


# OPERATOR
class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Operator
        model_fields = '__all__'


class SelectOperatorIn(Schema):
    operator_id: int


class RequestAccessOut(Schema):
    user_operator_id: int


# USER OPERATOR
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
    bc_corporate_registry_number: Optional[int]
    business_structure: str
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    mailing_street_address: str
    mailing_municipality: str
    mailing_province: str
    mailing_postal_code: str
    website: Optional[str]


class UserOperatorIn(UserOperatorOut):
    """
    Schema for the UserOperator model
    """

    role: bool
    so_first_name: Optional[str]
    so_last_name: Optional[str]
    so_position_title: Optional[str]
    so_street_address: Optional[str]
    so_municipality: Optional[str]
    so_province: Optional[str]
    so_postal_code: Optional[str]
    so_email: Optional[str]
    so_phone_number: Optional[str]
    operator_has_parent_company: bool
    pc_legal_name: Optional[str]
    pc_cra_business_number: Optional[int]
    pc_bc_corporate_registry_number: Optional[int]
    pc_business_structure: Optional[str]
    pc_physical_street_address: Optional[str]
    pc_physical_municipality: Optional[str]
    pc_physical_province: Optional[str]
    pc_physical_postal_code: Optional[str]
    pc_mailing_street_address: Optional[str]
    pc_mailing_municipality: Optional[str]
    pc_mailing_province: Optional[str]
    pc_mailing_postal_code: Optional[str]
    percentage_owned_by_parent_company: Optional[int]
