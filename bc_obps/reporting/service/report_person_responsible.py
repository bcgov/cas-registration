from dataclasses import asdict
from typing import Optional, Dict, Any
from reporting.models import ReportPersonResponsible
from reporting.models.report_version import ReportVersion
from reporting.dataclass import ReportPersonResponsibleData


class ReportContactService:
    @classmethod
    def get_report_person_responsible_by_version_id(cls, report_version_id: int) -> Optional[ReportPersonResponsible]:
        return ReportPersonResponsible.objects.filter(report_version__id=report_version_id).first()

    @classmethod
    def save_report_contact(
        cls,
        version_id: int,
        payload: Dict[str, Any],
    ) -> ReportPersonResponsible:

        report_version: Optional[ReportVersion] = ReportVersion.objects.filter(id=version_id).first()

        if report_version is None:
            raise ValueError("ReportVersion with this ID does not exist.")

        data = ReportPersonResponsibleData(**payload)

        defaults = {key: value for key, value in asdict(data).items() if key != "report_version"}

        report_person_responsible, _created = ReportPersonResponsible.objects.update_or_create(
            report_version=report_version,
            defaults=defaults,
        )

        return report_person_responsible
