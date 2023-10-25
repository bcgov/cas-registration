from typing import Optional
from ninja import Field, Schema
from ninja import ModelSchema
from .models import Operation, Operator, NaicsCode, NaicsCategory
from datetime import date


# Generic schemas
class Message(Schema):
    message: str


# Naics code schemas
class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Config:
        model = NaicsCode
        model_fields = "__all__"


class NaicsCategorySchema(ModelSchema):
    """
    Schema for the NaicsCategory model
    """

    class Config:
        model = NaicsCategory
        model_fields = "__all__"


# Operation schemas
class OperationSchema(ModelSchema):
    """
    Schema for the Operation model
    """

    class Config:
        model = Operation
        model_fields = "__all__"


class OperationIn(OperationSchema):
    # temporarily setting a default operator since we don't have login yet
    operator: int = 1
    # Converting types
    start_of_commercial_operation: Optional[date] = None
    verified_at: Optional[date] = None


class OperationOut(OperationSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    naics_category_id: int = Field(..., alias="naics_category.id")
    previous_year_attributable_emissions: Optional[str] = None
    swrs_facility_id: Optional[str] = None
    bcghg_id: Optional[str] = None
    current_year_estimated_emissions: Optional[str] = None
    opt_in: Optional[bool] = None
    new_entrant: Optional[bool] = None
    start_of_commercial_operation: Optional[date] = None
    major_new_operation: Optional[bool] = None
    verified_at: Optional[date] = None
    # temp handling of many to many field, addressed in #138
    # contacts:
    # documents:
    # regulated_products:
    # petrinex_ids:


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
    mailing_address_same_as_physical: bool
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
    pc_mailing_address_same_as_physical: Optional[bool]
    pc_mailing_street_address: Optional[str]
    pc_mailing_municipality: Optional[str]
    pc_mailing_province: Optional[str]
    pc_mailing_postal_code: Optional[str]
    percentage_owned_by_parent_company: Optional[int]
