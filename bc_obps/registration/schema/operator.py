from typing import List, Optional
from ninja import Field, Schema
from ninja import ModelSchema, Schema, Field
from registration.constants import AUDIT_FIELDS
from registration.models import Operator
from .parent_operator import ParentOperatorOut


class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    physical_street_address: Optional[str] = Field(None, alias="physical_address.street_address")
    physical_municipality: Optional[str] = Field(None, alias="physical_address.municipality")
    physical_province: Optional[str] = Field(None, alias="physical_address.province")
    physical_postal_code: Optional[str] = Field(None, alias="physical_address.postal_code")
    mailing_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    mailing_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    mailing_province: Optional[str] = Field(None, alias="mailing_address.province")
    mailing_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = Field(None, alias="parent_operators")

    @staticmethod
    def resolve_operator_has_parent_operators(obj: Operator) -> bool:
        return obj.parent_operators.exists()

    class Config:
        model = Operator
        model_exclude = [*AUDIT_FIELDS]


class OperatorIn(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Operator
        model_fields = ['status']


class SelectOperatorIn(Schema):
    operator_id: int


class OperatorExternalDashboardUsersTileData(ModelSchema):

    """
    Schema for fields from the Operator model that are needed in ExternalDashboardUsersTileData
    """

    class Config:
        model = Operator
        model_fields = ["legal_name"]
