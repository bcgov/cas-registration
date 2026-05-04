from uuid import UUID
from reporting.models.report_version import ReportVersion
from reporting.service.report_sign_off_service import (
    ReportSignOffAcknowledgements,
    ReportSignOffData,
)
from reporting.service.report_submission_service import ReportSubmissionService

from .report_verification import create_report_verification
from .report_attachments import create_report_verification_statement_attachment
from .report_contact import create_report_person_responsible
from .report_activity_data import prepare_activity_data_for_submission


def prepare_and_submit_report(report_version: ReportVersion, submitting_user: UUID):
    """
    Orchestrates all required setup before submitting a report.
    """

    # TODO
    # report_production_data	Production values
    # report_emission_allocation	Allocation data
    # etc.
    prepare_activity_data_for_submission(report_version)
    create_report_person_responsible(report_version)

    create_report_verification(report_version)
    create_report_verification_statement_attachment(report_version, submitting_user)

    # submit
    _submit(report_version, submitting_user)


def submit_report_from_fixture(report_version: ReportVersion, submitting_user: UUID):

    prepare_and_submit_report(report_version, submitting_user)


def _submit(report_version: ReportVersion, submitting_user: UUID):
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
            signature="me",
        ),
    )
