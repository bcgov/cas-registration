from dataclasses import dataclass
from typing import Optional
from django.db import transaction
from django.utils import timezone
from reporting.models.report_sign_off import ReportSignOff
from django.core.exceptions import ValidationError


@dataclass
class ReportSignOffAcknowledgements:
    acknowledgement_of_review: Optional[bool]
    acknowledgement_of_certification: Optional[bool]
    acknowledgement_of_records: bool
    acknowledgement_of_information: Optional[bool]
    acknowledgement_of_possible_costs: Optional[bool]
    acknowledgement_of_new_version: Optional[bool]
    acknowledgement_of_corrections: Optional[bool]
    acknowledgement_of_errors: Optional[bool]


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
                acknowledgement_of_corrections=acknowledgements.acknowledgement_of_corrections,
                acknowledgement_of_records=acknowledgements.acknowledgement_of_records,
                acknowledgement_of_certification=acknowledgements.acknowledgement_of_certification,
                acknowledgement_of_information=acknowledgements.acknowledgement_of_information,
                acknowledgement_of_errors=acknowledgements.acknowledgement_of_errors,
                acknowledgement_of_possible_costs=acknowledgements.acknowledgement_of_possible_costs,
                acknowledgement_of_new_version=acknowledgements.acknowledgement_of_new_version,
                signature=data.signature,
                signing_date=timezone.now(),
            )

            return report_sign_off_record
        else:
            raise ValidationError(["All fields must be accepted and filled out to sign off the report."])

    @staticmethod
    def validate_report_sign_off(acknowledgements: ReportSignOffAcknowledgements) -> bool:
        return all(
            [
                acknowledgements.acknowledgement_of_records,
                acknowledgements.acknowledgement_of_review in (True, None),
                acknowledgements.acknowledgement_of_certification in (True, None),
                acknowledgements.acknowledgement_of_information in (True, None),
                acknowledgements.acknowledgement_of_errors in (True, None),
                acknowledgements.acknowledgement_of_possible_costs in (True, None),
                acknowledgements.acknowledgement_of_new_version in (True, None),
                acknowledgements.acknowledgement_of_corrections in (True, None),
            ]
        )
