from dataclasses import asdict
from typing import Optional
from reporting.models import ReportPersonResponsible
from reporting.models.report_version import ReportVersion
from dataclasses import dataclass


@dataclass
class ReportPersonResponsibleData:
    contact_id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    position_title: str
    business_role: str
    street_address: str
    municipality: str
    province: str
    postal_code: str


class ReportContactService:
    @classmethod
    def get_report_person_responsible_by_version_id(cls, report_version_id: int) -> Optional[ReportPersonResponsible]:
        return ReportPersonResponsible.objects.filter(report_version__id=report_version_id).first()

    @classmethod
    def save_report_contact(
        cls,
        version_id: int,
        data: ReportPersonResponsibleData,
    ) -> ReportPersonResponsible:

        report_version: Optional[ReportVersion] = ReportVersion.objects.filter(id=version_id).first()

        if report_version is None:
            raise ValueError("ReportVersion with this ID does not exist.")

        report_person_responsible, _created = ReportPersonResponsible.objects.update_or_create(
            report_version=report_version,
            defaults=asdict(data),
        )

        return report_person_responsible
