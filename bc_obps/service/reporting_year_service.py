from django.utils import timezone
from reporting.models.reporting_year import ReportingYear


class ReportingYearService:
    @classmethod
    def get_current_reporting_year(cls) -> ReportingYear:
        now = timezone.now()

        return ReportingYear.objects.get(reporting_window_start__lte=now, reporting_window_end__gte=now)

    @classmethod
    def is_reporting_open(cls, reporting_year: ReportingYear) -> bool:
        """
        Determines if reporting is currently open based on server time.
        Returns True if current time is after the report_open_date.
        """
        now = timezone.now()
        return now > reporting_year.report_open_date if reporting_year.report_open_date else False
