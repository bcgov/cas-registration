from ninja import ModelSchema
from reporting.models.reporting_year import ReportingYear
from service.reporting_year_service import ReportingYearService


class ReportingYearOut(ModelSchema):
    """
    Schema for the get reporting year endpoint request output
    """

    is_reporting_open: bool
    report_due_year: int
    # https://github.com/vitalik/django-ninja/pull/1249
    reporting_year: int

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

    @staticmethod
    def resolve_report_due_year(obj: ReportingYear) -> int:
        """Year the annual report is due, derived from report_due_date"""
        return obj.report_due_date.year
