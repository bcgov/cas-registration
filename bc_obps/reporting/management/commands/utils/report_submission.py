from datetime import datetime, timezone
from uuid import UUID
from reporting.models.report_version import ReportVersion
from reporting.service.report_sign_off_service import (
    ReportSignOffAcknowledgements,
    ReportSignOffData,
)
from reporting.service.report_submission_service import ReportSubmissionService

from .report_verification import create_report_verification
from .report_attachments import create_report_verification_statement_attachment
from .report_person_responsible import create_report_person_responsible
from .report_activity_data import prepare_activity_data_for_submission
from .report_additional_data import create_report_additional_data
from .report_emission_allocation import prepare_emission_allocation_for_submission
from .report_facility_report import mark_facility_reports_complete
from .report_production_data import prepare_production_data_for_submission

FIXED_SNAPSHOT_TIMESTAMP = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)


def prepare_and_submit_report(report_version: ReportVersion, submitting_user: UUID):
    """
    Orchestrates all required setup before submitting a report.
    """

    prepare_activity_data_for_submission(report_version)
    create_report_person_responsible(report_version)
    create_report_additional_data(report_version)
    prepare_production_data_for_submission(report_version)
    prepare_emission_allocation_for_submission(report_version)
    mark_facility_reports_complete(report_version)
    create_report_verification(report_version)
    create_report_verification_statement_attachment(report_version, submitting_user)

    # submit
    _submit(report_version, submitting_user)


def submit_report_from_fixture(report_version: ReportVersion, submitting_user: UUID):

    prepare_and_submit_report(report_version, submitting_user)


def _submit(report_version: ReportVersion, submitting_user: UUID):
    from common.lib import pgtrigger

    submitted = ReportSubmissionService.submit_report(
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

    with pgtrigger.ignore(
        "reporting.ReportVersion:immutable_report_version",
        "reporting.ReportVersion:set_updated_audit_columns",
    ):
        ReportVersion.objects.filter(id=submitted.id).update(updated_at=FIXED_SNAPSHOT_TIMESTAMP)
