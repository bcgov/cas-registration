from reporting.models.reporting_year import ReportingYear


class ReportingYearService:
    @classmethod
    def get_current_reporting_year():
        return ReportingYear
