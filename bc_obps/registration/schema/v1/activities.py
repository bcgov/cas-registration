from ninja import ModelSchema
from registration.models import Activity


class ActivitySchema(ModelSchema):
    """
    Schema for the ReportingActivity model
    """

    class Config:
        model = Activity
        model_fields = ["name", "applicable_to"]
