from ninja import ModelSchema

from registration.models import Activity


class FacilityReportActivityDataOut(ModelSchema):
    """
    Schema for the facility report activities list endpoint return type
    """

    class Meta:
        model = Activity
        fields = ['id', 'name', 'slug']
