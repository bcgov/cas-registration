from uuid import UUID
from ninja import Field
from ninja import ModelSchema
from registration.models import Operator


class OperatorExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the Operator model that are needed in ExternalDashboardUsersTileData
    """

    class Meta:
        model = Operator
        fields = ["legal_name"]


class OperatorFromUserOperatorOut(ModelSchema):
    """
    Schema for the Operator associated with a UserOperator
    """

    operator_id: UUID = Field(..., alias="id")

    class Meta:
        model = Operator
        fields = ["status"]
