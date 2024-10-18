from ninja import ModelSchema

from reporting.models import ReportVersion


class ReportingVersionOut(ModelSchema):
    """
    Schema for the get reporting year endpoint request output
    """

    class Meta:
        model = ReportVersion
        fields = ['report_type']
