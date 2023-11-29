from ninja import ModelSchema
from registration.models import ReportingActivity


class ReportingActivitySchema(ModelSchema):
    """
    Schema for the ReportingActivity model
    """

    class Config:
        model = ReportingActivity
        model_fields = "__all__"
