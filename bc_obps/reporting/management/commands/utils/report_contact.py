from reporting.dataclass import ReportPersonResponsibleData
from reporting.models.report_version import ReportVersion
from reporting.service.report_person_responsible import ReportContactService
from dataclasses import asdict


def create_report_person_responsible(report_version: ReportVersion):

    ReportContactService.save_report_contact(
        report_version.id,
        asdict(
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
            )
        ),
    )
