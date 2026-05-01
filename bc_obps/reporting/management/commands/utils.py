from uuid import UUID
from django.core.files.base import ContentFile
from reporting.models.report_version import ReportVersion
from reporting.schema.report_verification import ReportVerificationIn
from reporting.service.report_attachment_service import ReportAttachmentService
from reporting.service.report_sign_off_service import ReportSignOffAcknowledgements, ReportSignOffData
from reporting.service.report_submission_service import ReportSubmissionService
from reporting.service.report_verification_service import ReportVerificationService
from django.core.management import call_command


def load_extra_report_fixtures(fixture_base_dir: str, stdout=None, style=None):
    extra = [
        f'{fixture_base_dir}/report_person_responsible.json',
        f'{fixture_base_dir}/report_raw_activity_data.json',
        f'{fixture_base_dir}/report_activity.json',
        f'{fixture_base_dir}/report_source_type.json',
        f'{fixture_base_dir}/report_unit.json',
        f'{fixture_base_dir}/report_fuel.json',
        f'{fixture_base_dir}/report_emission.json',
        f'{fixture_base_dir}/report_methodology.json',
        f'{fixture_base_dir}/report_product.json',
        f'{fixture_base_dir}/report_emission_allocation.json',
        f'{fixture_base_dir}/report_product_emission_allocation.json',
        f'{fixture_base_dir}/report_additional_data.json',
        f'{fixture_base_dir}/report_verification.json',
        f'{fixture_base_dir}/report_attachment.json',
    ]

    for fixture in extra:
        if stdout and style:
            stdout.write(style.SUCCESS(f"Loading additional report fixture: {fixture}"))
        call_command('loaddata', fixture)


def submit_report_from_fixture(report_version: ReportVersion, submitting_user: UUID):
    ReportVerificationService.save_report_verification(
        report_version.id,
        ReportVerificationIn(
            verification_conclusion='conclude',
        ),
    )
    ReportAttachmentService.set_attachment(
        report_version.id,
        submitting_user,
        "verification_statement",
        ContentFile(b"data1", "file1.pdf"),
    )
    verification_statement = ReportAttachmentService.get_attachments_by_version(report_version.id).first()
    verification_statement.status = 'Clean'
    verification_statement.save()

    # submit!
    ReportSubmissionService.submit_report(
        report_version.id,
        submitting_user,
        ReportSignOffData(
            ReportSignOffAcknowledgements(
                acknowledgement_of_records=True,
                acknowledgement_of_review=True,
                acknowledgement_of_certification=True,
                acknowledgement_of_information=True,
                acknowledgement_of_possible_costs=True,
                acknowledgement_of_new_version=True,
                acknowledgement_of_corrections=True,
                acknowledgement_of_errors=True,
            ),
            signature='me',
        ),
    )
