from reporting.models.reporting_year import ReportingYear
from datetime import datetime
from zoneinfo import ZoneInfo


class ReportingYearService:
    @classmethod
    def get_current_reporting_year(cls) -> ReportingYear:
        now = datetime.now(ZoneInfo("America/Vancouver"))

        return ReportingYear.objects.get(reporting_window_start__lte=now, reporting_window_end__gte=now)
