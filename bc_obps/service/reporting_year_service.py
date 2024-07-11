from reporting.models.reporting_year import ReportingYear


class ReportingYearService:
    @classmethod
    def get_current_reporting_year(cls) -> ReportingYear:
        return ReportingYear.objects.get(reporting_year=2024)
