from ninja import ModelSchema
from registration.models import ReportingActivity


class ReportingActivitySchema(ModelSchema):
    """
    Schema for the ReportingActivity model
    """

    class Meta:
        model = ReportingActivity
        fields = "__all__"
