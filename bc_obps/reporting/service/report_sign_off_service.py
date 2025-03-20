import datetime
from xml.dom import ValidationErr
from django.db import transaction
from reporting.models.report_sign_off import ReportSignOff
from reporting.schema.report_sign_off import ReportSignOffIn, ReportSignOffOut


class ReportSignOffService:
    @classmethod
    @transaction.atomic
    def save_report_sign_off(cls, report_version_id: int, data: ReportSignOffIn) -> ReportSignOff | None:
        if (
            data.acknowledgement_of_review
            and data.acknowledgement_of_records
            and data.acknowledgement_of_information
            and data.acknowledgement_of_impact
        ):
            report_sign_off_record, _ = ReportSignOff.objects.update_or_create(
                report_version_id=report_version_id,
                acknowledgement_of_review=data.acknowledgement_of_review,
                acknowledgement_of_records=data.acknowledgement_of_records,
                acknowledgement_of_information=data.acknowledgement_of_information,
                acknowledgement_of_impact=data.acknowledgement_of_impact,
                signature=data.signature,
                signing_date=datetime.datetime.now(),
            )

            return report_sign_off_record
        else:
            raise ValidationErr("All fields must be accepted and filled out to sign off the report.")

    @classmethod
    def get_report_sign_off(cls, report_version_id: int) -> ReportSignOffOut:

        sign_off = ReportSignOff.objects.filter(report_version_id=report_version_id).first()
        if sign_off:
            return ReportSignOffOut(
                acknowledgement_of_review=sign_off.acknowledgement_of_review,
                acknowledgement_of_records=sign_off.acknowledgement_of_records,
                acknowledgement_of_information=sign_off.acknowledgement_of_information,
                acknowledgement_of_impact=sign_off.acknowledgement_of_impact,
                signature=sign_off.signature,
                date=sign_off.signing_date.strftime("%B %d, %Y"),
            )
        else:
            return ReportSignOffOut(
                acknowledgement_of_review=False,
                acknowledgement_of_records=False,
                acknowledgement_of_information=False,
                acknowledgement_of_impact=False,
                signature="",
                date="",
            )
