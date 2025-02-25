from typing import Optional

from reporting.models import ReportPersonResponsible
from reporting.models.report_version import ReportVersion
from reporting.schema.report_person_responsible import ReportPersonResponsibleIn


class ReportContactService:
    @classmethod
    def get_report_person_responsible_by_version_id(cls, report_version_id: int) -> Optional[ReportPersonResponsible]:
        return ReportPersonResponsible.objects.filter(report_version__id=report_version_id).first()

    @classmethod
    def save_report_contact(cls, version_id: int, data: ReportPersonResponsibleIn) -> ReportPersonResponsible:
        report_version: Optional[ReportVersion] = ReportVersion.objects.filter(id=version_id).first()

        if report_version is None:
            raise ValueError("ReportVersion with this ID does not exist.")

        report_person_responsible, created = ReportPersonResponsible.objects.update_or_create(
            report_version=report_version,
            defaults={
                'first_name': data.first_name,
                'last_name': data.last_name,
                'email': data.email,
                'phone_number': data.phone_number,
                'position_title': data.position_title,
                'business_role': data.business_role,
                'street_address': data.street_address,
                'municipality': data.municipality,
                'province': data.province,
                'postal_code': data.postal_code,
            },
        )

        return report_person_responsible
