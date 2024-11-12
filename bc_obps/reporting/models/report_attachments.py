from django.db.models import FileField
from registration.models.time_stamped_model import TimeStampedModel

FOLDER_NAME = 'documents'


class ReportAttachments(TimeStampedModel):

    verification_statement = FileField(
        upload_to=FOLDER_NAME,
        db_comment="The verification statement uploaded as part of the report",
    )

    wci_352_362 = FileField(
        upload_to=FOLDER_NAME,
        db_comment="The additional documentation required under WCI.352 and WCI.362",
        null=True,
        blank=True,
    )

    additional_reportable_information = FileField(
        upload_to=FOLDER_NAME,
        db_comment="Additional reportable information, if required.",
        null=True,
        blank=True,
    )

    confidentiality_request = FileField(
        upload_to=FOLDER_NAME,
        db_comment="Confidentiality request form, if confidentiality is requested under B.C. Reg. 249/2015 Reporting Regulation",
        null=True,
        blank=True,
    )

    class Meta:
        db_table_comment = "Table containing the required attachments for a report."
        db_table = 'erc"."report_attachments'
        app_label = 'reporting'
