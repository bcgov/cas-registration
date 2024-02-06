from typing import List, Optional
from registration.schema.operator import OperatorForOperationOut
from registration.utils import file_to_data_url, data_url_to_file
from ninja import Field, ModelSchema, Schema
from registration.constants import AUDIT_FIELDS
from registration.models import Operation
from datetime import date
from pydantic import validator


#### Operation schemas


class OperationCreateOut(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["id", "name"]


class OperationCreateIn(ModelSchema):
    # Not using Multiple operators for MVP
    # operation_has_multiple_operators: Optional[bool] = False
    # multiple_operators_array: Optional[list] = None

    class Config:
        model = Operation
        model_fields = ['name', 'type', 'naics_code', 'opt_in', 'regulated_products', 'bcghg_id']
        allow_population_by_field_name = True


class OperationUpdateOut(Schema):
    name: str


class OperationUpdateIn(ModelSchema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position_title: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    # external point of contact details
    external_point_of_contact_first_name: Optional[str] = None
    external_point_of_contact_last_name: Optional[str] = None
    external_point_of_contact_position_title: Optional[str] = None
    external_point_of_contact_email: Optional[str] = None
    external_point_of_contact_phone_number: Optional[str] = None
    is_external_point_of_contact: Optional[bool] = None
    statutory_declaration: Optional[str] = None

    @validator("statutory_declaration")
    @classmethod
    def validate_statutory_declaration(cls, value: str):
        if value:
            return data_url_to_file(value)

    class Config:
        model = Operation
        model_fields = ['name', 'type', 'naics_code', 'opt_in', 'point_of_contact', 'regulated_products']
        allow_population_by_field_name = True


class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")

    class Config:
        model = Operation
        model_fields = ['id', 'name', 'bcghg_id', 'submission_date', 'status']


class OperationOut(ModelSchema):
    naics_code_id: Optional[int] = Field(None, alias="naics_code.id")
    first_name: Optional[str] = Field(None, alias="point_of_contact.first_name")
    last_name: Optional[str] = Field(None, alias="point_of_contact.last_name")
    email: Optional[str] = Field(None, alias="point_of_contact.email")
    phone_number: Optional[str]  # can't use resolvers with aliases, so handling everything in the resolver
    position_title: Optional[str] = Field(None, alias="point_of_contact.position_title")
    street_address: Optional[str] = Field(None, alias="point_of_contact.address.street_address")
    municipality: Optional[str] = Field(None, alias="point_of_contact.address.municipality")
    province: Optional[str] = Field(None, alias="point_of_contact.address.province")
    postal_code: Optional[str] = Field(None, alias="point_of_contact.address.postal_code")
    # Not using Multiple operators for MVP
    # operation_has_multiple_operators: Optional[bool] = Field(False, alias="operation_has_multiple_operators")
    # multiple_operators_array: Optional["List[MultipleOperatorOut]"] = Field(None, alias="multiple_operator")
    statutory_declaration: Optional[str] = None
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")

    @staticmethod
    def resolve_statutory_declaration(obj: Operation):
        statutory_declaration = obj.get_statutory_declaration()
        if statutory_declaration:
            return file_to_data_url(statutory_declaration)
        return None

    @staticmethod
    def resolve_phone_number(obj):
        # PhoneNumberField returns a PhoneNumber object and we need a string
        if not obj.point_of_contact:
            return
        return str(obj.point_of_contact.phone_number)

    class Config:
        model = Operation
        model_fields = [
            "id",
            'name',
            'type',
            'bcghg_id',
            'opt_in',
            'regulated_products',
            'previous_year_attributable_emissions',
            'status',
        ]


class OperationWithOperatorOut(OperationOut):  # used for irc users
    operator: OperatorForOperationOut = Field(..., alias="operator")


# Not using Multiple operators for MVP
# from .multiple_operator import MultipleOperatorOut
# OperationOut.update_forward_refs()


class OperationUpdateStatusIn(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["status"]


class OperationUpdateStatusOut(ModelSchema):
    class Config:
        model = Operation
        model_fields = ["id"]
        
class OperationListOut(Schema):
    operation_list: List[OperationOut]
    total_pages: int
    
class OperationPaginatedOut(Schema):
    data: List[OperationOut]
    row_count: int
    total_pages: int
