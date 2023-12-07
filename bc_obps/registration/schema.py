from typing import List, Optional
from ninja import Field, Schema
from ninja import ModelSchema
from .models import Operation, Operator, NaicsCode, NaicsCategory, MultipleOperator
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


#### Operation schemas
class OperationIn(ModelSchema):
    # temporarily setting a default operator since we don't have login yet
    operator_id: int = 1
    # Converting types
    naics_code_id: int
    naics_category_id: int
    verified_at: Optional[date] = None
    operation_has_multiple_operators: Optional[bool] = None
    multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_exclude = ["id"]  # need to exclude id since it's auto generated and we don't want to pass it in


class MultipleOperatorOut(ModelSchema):
    """
    Schema for the MultipleOperator model
    """

    # operation_id: int = Field(..., alias="operation.id")
    operation: OperationIn

    class Config:
        model = MultipleOperator
        model_fields = '__all__'


class OperationOut(ModelSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    naics_category_id: int = Field(..., alias="naics_category.id")
    previous_year_attributable_emissions: Optional[str] = None
    swrs_facility_id: Optional[str] = None
    bcghg_id: Optional[str] = None
    current_year_estimated_emissions: Optional[str] = None
    opt_in: Optional[bool] = None
    verified_at: Optional[date] = None
    operation_has_multiple_operators: Optional[bool] = Field(..., alias="operation_has_multiple_operators")
    multiple_operators_array: List[MultipleOperatorOut]

    @staticmethod
    def resolve_multiple_operators_array(obj):
        if obj.multiple_operator.exists():
            return [MultipleOperatorOut.from_orm(operator).dict() for operator in obj.multiple_operator.all()]
        return None

    class Config:
        model = Operation
        model_fields = "__all__"


OperationOut.update_forward_refs()


# OPERATOR
class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Operator
        model_fields = '__all__'


class MultipleOperatorIn(Schema):
    operation_id: int
    mo_legal_name: str
    mo_trade_name: str
    mo_cra_business_number: int
    mo_bc_corporate_registry_number: int
    mo_business_structure: str
    mo_website: Optional[str]
    mo_physical_street_address: str
    mo_physical_municipality: str
    mo_physical_province: str
    mo_physical_postal_code: str
    mo_mailing_street_address: Optional[str]
    mo_mailing_municipality: Optional[str]
    mo_mailing_province: Optional[str]
    mo_mailing_postal_code: Optional[str]


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

    is_senior_officer: bool
    mailing_address_same_as_physical: bool
    # so => senior officer
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
    # pc => parent company
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


# AppRole schemas
class AppRoleOut(Schema):
    role_name: str
    role_description: str
