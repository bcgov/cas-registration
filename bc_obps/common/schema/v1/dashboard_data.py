from common.models import DashboardData
from ninja import ModelSchema


class DashboardDataSchemaOut(ModelSchema):
    class Meta:
        model = DashboardData
        fields = ['data']
