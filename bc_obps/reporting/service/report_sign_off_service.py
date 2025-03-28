from dataclasses import dataclass
import datetime
from django.db import transaction
from reporting.models.report_sign_off import ReportSignOff
from django.core.exceptions import ValidationError


@dataclass
class ReportSignOffAcknowledgements:
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool | None
    acknowledgement_of_possible_costs: bool
    acknowledgement_of_new_version: bool | None


@dataclass
class ReportSignOffData:
    acknowledgements: ReportSignOffAcknowledgements
    signature: str


class ReportSignOffService:
    @classmethod
    @transaction.atomic
    def save_report_sign_off(cls, report_version_id: int, data: ReportSignOffData) -> ReportSignOff | None:
        acknowledgements = data.acknowledgements
        if ReportSignOffService.validate_report_sign_off(acknowledgements):
            report_sign_off_record, _ = ReportSignOff.objects.update_or_create(
                report_version_id=report_version_id,
                acknowledgement_of_review=acknowledgements.acknowledgement_of_review,
                acknowledgement_of_records=acknowledgements.acknowledgement_of_records,
                acknowledgement_of_information=acknowledgements.acknowledgement_of_information,
                acknowledgement_of_possible_costs=acknowledgements.acknowledgement_of_possible_costs,
                acknowledgement_of_new_version=acknowledgements.acknowledgement_of_new_version,
                acknowledgement_of_corrections=acknowledgements.acknowledgement_of_corrections,
                signature=data.signature,
                signing_date=datetime.datetime.now(),
            )

            return report_sign_off_record
        else:
            raise ValidationError(["All fields must be accepted and filled out to sign off the report."])

    @staticmethod
    def validate_report_sign_off(acknowledgements: ReportSignOffAcknowledgements) -> bool:
        return (
            acknowledgements.acknowledgement_of_review
            and acknowledgements.acknowledgement_of_records
            and (
                acknowledgements.acknowledgement_of_information
                or acknowledgements.acknowledgement_of_information is None
            )
            and (
                acknowledgements.acknowledgement_of_possible_costs
                or acknowledgements.acknowledgement_of_possible_costs is None
            )
            and (
                acknowledgements.acknowledgement_of_new_version
                or acknowledgements.acknowledgement_of_new_version is None
            )
            and (
                acknowledgements.acknowledgement_of_corrections
                or acknowledgements.acknowledgement_of_corrections is None
            )
        )
