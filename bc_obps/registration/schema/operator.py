from ninja import Schema
from ninja import ModelSchema
from registration.models import Operator


class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Meta:
        model = Operator
        fields = '__all__'


class SelectOperatorIn(Schema):
    operator_id: int
