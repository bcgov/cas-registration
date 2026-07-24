from reporting.models.report_version import ReportVersion
from reporting.service.report_person_responsible import (
    ReportPersonResponsibleData,
    ReportContactService,
)


def create_report_person_responsible(report_version: ReportVersion):
    if ReportContactService.get_report_person_responsible_by_version_id(report_version.id):
        return

    ReportContactService.save_report_contact(
        report_version.id,
        ReportPersonResponsibleData(
            contact_id=None,
            first_name='Test',
            last_name='User',
            email='test.user@example.com',
            phone_number='+16044011234',
            position_title='Manager',
            business_role='Operator',
            street_address='123 Test Street',
            municipality='Victoria',
            province='BC',
            postal_code='V8V 1X4',
        ),
    )
