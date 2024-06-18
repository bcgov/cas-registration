from registration import models


class ReportService:
    @classmethod
    def create_report(cls, operation: models.Operation, reporting_year: int) -> bool:
        return True
