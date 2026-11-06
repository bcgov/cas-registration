from reporting.models.reporting_year import ReportingYear


class ReportingYearDataAccessService:
    @classmethod
    def get_by_year(cls, year: int) -> ReportingYear:
        return ReportingYear.objects.get(reporting_year=year)
