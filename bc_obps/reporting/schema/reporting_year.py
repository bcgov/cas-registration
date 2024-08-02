from ninja import ModelSchema
from reporting.models.reporting_year import ReportingYear


class ReportingYearOut(ModelSchema):
    """
    Schema for the get reporting year endpoint request output
    """

    class Meta:
        model = ReportingYear
        fields = [
            'reporting_year',
            'report_due_date',
        ]
