from ninja import ModelSchema
from reporting.models.reporting_year import ReportingYear
from service.reporting_year_service import ReportingYearService


class ReportingYearOut(ModelSchema):
    """
    Schema for the get reporting year endpoint request output
    """

    is_reporting_open: bool

    class Meta:
        model = ReportingYear
        fields = [
            'reporting_year',
            'report_due_date',
            'reporting_window_end',
            'report_open_date',
        ]

    @staticmethod
    def resolve_is_reporting_open(obj: ReportingYear) -> bool:
        """Compute whether reporting is currently open based on server time"""
        return ReportingYearService.is_reporting_open(obj)
