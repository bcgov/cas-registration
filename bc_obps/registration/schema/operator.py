from ninja import Schema
from ninja import ModelSchema
from registration.constants import AUDIT_FIELDS
from registration.models import Operator


class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

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
