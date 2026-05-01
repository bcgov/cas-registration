from reporting.dataclass import ReportPersonResponsibleData
from reporting.models.report_version import ReportVersion
from reporting.service.report_person_responsible import ReportContactService


def create_report_person_responsible(report_version: ReportVersion):
    ReportContactService.save_report_contact(
        report_version.id,
        ReportPersonResponsibleData(
            first_name='Test',
            last_name='User',
            email='test.user@example.com',
            phone_number='+16044011236',
            position_title='Manager',
            business_role='Operator',
            street_address='123 Test Street',
            municipality='Victoria',
            province='BC',
            postal_code='V8V 1X4',
        ),
    )
