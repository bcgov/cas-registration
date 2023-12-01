from typing import List, Optional
from ninja import Field, ModelSchema, Schema
from registration.models import MultipleOperator, Operation, Contact
from datetime import date
from .contact import ContactSchema


#### Operation schemas


class OperationCreateOut(Schema):
    id: int
    name: str


class OperationCreateIn(ModelSchema):
    operator_id: int
    # Converting types
    naics_code_id: int
    verified_at: Optional[date] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_exclude = ["id"]  # need to exclude id since it's auto generated and we don't want to pass it in


class OperationUpdateOut(Schema):
    name: str


class OperationUpdateIn(ModelSchema):
    operator_id: int
    # Converting types
    naics_code_id: int
    verified_at: Optional[date] = None
    # application lead details
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position_title: Optional[str] = None
    street_address: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    application_lead: Optional[int] = None
    is_application_lead_external: Optional[bool] = None
    operation_has_multiple_operators: Optional[bool] = False
    multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_exclude = ["id"]  # need to exclude id since it's auto generated and we don't want to pass it in


### Multiple Operator schemas
# TODO: find solution to circular import error and put multiple operator schemas in multiple_operator.py


class MultipleOperatorIn(Schema):
    operation_id: int
    mo_legal_name: str
    mo_trade_name: str
    mo_cra_business_number: int
    mo_bc_corporate_registry_number: int
    mo_business_structure: Optional[str]
    mo_website: Optional[str]
    mo_physical_street_address: str
    mo_physical_municipality: str
    mo_physical_province: str
    mo_physical_postal_code: str
    mo_mailing_address_same_as_physical: Optional[bool] = False
    mo_mailing_street_address: Optional[str]
    mo_mailing_municipality: Optional[str]
    mo_mailing_province: Optional[str]
    mo_mailing_postal_code: Optional[str]


class MultipleOperatorOut(ModelSchema):
    """
    Schema for the MultipleOperator model
    """

    mo_legal_name: str = Field(..., alias="legal_name")
    mo_trade_name: str = Field(..., alias="trade_name")
    mo_cra_business_number: int = Field(..., alias="cra_business_number")
    mo_bc_corporate_registry_number: int = Field(..., alias="bc_corporate_registry_number")
    mo_business_structure: Optional[str] = Field(..., alias="business_structure")
    mo_website: Optional[str] = Field(..., alias="website")
    mo_percentage_ownership: int = Field(None, alias="percentage_ownership")
    mo_physical_street_address: str = Field(..., alias="physical_street_address")
    mo_physical_municipality: str = Field(..., alias="physical_municipality")
    mo_physical_province: str = Field(..., alias="physical_province")
    mo_physical_postal_code: str = Field(..., alias="physical_postal_code")
    mo_mailing_address_same_as_physical: Optional[bool] = Field(False, alias="mailing_address_same_as_physical")
    mo_mailing_street_address: Optional[str] = Field(None, alias="mailing_street_address")
    mo_mailing_municipality: Optional[str] = Field(None, alias="mailing_municipality")
    mo_mailing_province: Optional[str] = Field(None, alias="mailing_province")
    mo_mailing_postal_code: Optional[str] = Field(None, alias="mailing_postal_code")

    operation: OperationCreateIn

    class Config:
        model = MultipleOperator
        model_fields = '__all__'


class OperationOut(ModelSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    previous_year_attributable_emissions: Optional[str] = None
    swrs_facility_id: Optional[str] = None
    bcghg_id: Optional[str] = None
    current_year_estimated_emissions: Optional[str] = None
    opt_in: Optional[bool] = None
    verified_at: Optional[date] = None
    is_application_lead_external: Optional[bool] = None
    application_lead: Optional[ContactSchema]
    operation_has_multiple_operators: Optional[bool] = Field(..., alias="operation_has_multiple_operators") or False
    multiple_operators_array: Optional[List[MultipleOperatorOut]] = None

    @staticmethod
    def resolve_multiple_operators_array(obj):
        if obj.multiple_operator.exists():
            # TODO: filter multple operators by archived_at is null or similar once #361 is done
            return [
                MultipleOperatorOut.from_orm(operator).dict()
                for operator in obj.multiple_operator.filter(operation_id=obj.id)
            ]
        return None

    class Config:
        model = Operation
        model_fields = "__all__"


OperationOut.update_forward_refs()
