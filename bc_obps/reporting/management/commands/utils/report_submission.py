from uuid import UUID
from reporting.models.report_version import ReportVersion
from reporting.service.report_sign_off_service import ReportSignOffAcknowledgements, ReportSignOffData
from reporting.service.report_submission_service import ReportSubmissionService
from reporting.management.commands.utils import (
    create_report_verification_statement_attachment,
    create_report_person_responsible,
    create_report_verification,
)


def submit_report_from_fixture(report_version: ReportVersion, submitting_user: UUID):
    # set up required data for submission
    create_report_person_responsible(report_version)
    # TODO
    # report_activity_data	Activities
    # report_production_data	Production values
    # report_emission_allocation	Allocation data
    # etc.
    create_report_verification(report_version)
    create_report_verification_statement_attachment(report_version, submitting_user)

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
