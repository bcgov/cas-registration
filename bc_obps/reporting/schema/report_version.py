from ninja import ModelSchema, Schema

from reporting.models import ReportVersion


class ReportingVersionOut(ModelSchema):
    """
    Schema for the get reporting year endpoint request output
    """

    class Meta:
        model = ReportVersion
        fields = ["report_type"]


class ReportVersionTypeIn(Schema):
    """
    Schema for changing the report version type
    """

    report_type: ReportVersion.ReportType
