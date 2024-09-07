from django.db import models
from registration.models.contact import Contact
from registration.models.time_stamped_model import TimeStampedModel
from registration.models.user_and_contact_common_info import UserAndContactCommonInfo
from reporting.models.report_version import ReportVersion


class ReportPersonResponsible(UserAndContactCommonInfo, TimeStampedModel):

    # A report version can have multiple persons responsible
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_persons_responsible",
        db_comment="The report version this person responsible applies to",
    )

    contact_id = models.ForeignKey(
        Contact,
        on_delete=models.DO_NOTHING,
        related_name='report_persons_responsible',
        db_comment="if applicable, the contact record this information was pulled from",
        blank=True,
        null=True,
    )

    mailing_address = models.CharField(
        max_length=10000, db_comment="the business mailing address of a person responsible, in one single text field."
    )

    class Meta:
        db_table_comment = "A table to store the data about the person responsible for the report"
        db_table = 'erc"."report_person_responsible'
        app_label = 'reporting'
