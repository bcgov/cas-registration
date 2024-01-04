from ninja import Schema
from ninja import ModelSchema
from registration.models import Operator
from registration.utils import AUDIT_FIELDS


class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Operator
        model_exclude = [*AUDIT_FIELDS]


class SelectOperatorIn(Schema):
    operator_id: int
