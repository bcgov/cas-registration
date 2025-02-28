from ninja import ModelSchema
from registration.models import Activity


class ActivitySchemaOut(ModelSchema):
    """
    Schema for the ActivitySchema model
    """

    class Meta:
        model = Activity
        fields = ['id', "name", "applicable_to"]
