from registration.models import Operation, NaicsCode
from reporting.models import ReportVersion, Report


class NaicsCodeService:
    @staticmethod
    def get_naics_code_by_version_id(version_id: int) -> str | None:
        """Fetch NAICS code based on report version ID."""
        operation = Operation.objects.get(
            id=Report.objects.get(id=ReportVersion.objects.get(id=version_id).report_id).operation_id
        )
        if operation.naics_code_id is None:
            return None

        else:
            return NaicsCode.objects.get(id=operation.naics_code_id).naics_code
