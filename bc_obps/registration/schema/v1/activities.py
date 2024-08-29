from ninja import ModelSchema
from registration.models import Activity


class ActivitySchema(ModelSchema):
    """
    Schema for the ActivitySchema model
    """

    class Meta:
        model = Activity
        fields = ["name", "applicable_to"]
