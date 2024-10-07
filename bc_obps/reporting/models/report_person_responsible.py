from django.db import models

from registration.models.time_stamped_model import TimeStampedModel
from registration.models.user_and_contact_common_info import UserAndContactCommonInfo
from reporting.models.report_version import ReportVersion


class ReportPersonResponsible(UserAndContactCommonInfo, TimeStampedModel):
    # A report version can have multiple persons responsible
    report_version = models.ForeignKey(
        ReportVersion,  # Use a string reference instead
        on_delete=models.PROTECT,
        related_name="report_persons_responsible",
        db_comment="The report version this person responsible applies to",
    )

    # contact = models.ForeignKey(
    #     Contact,
    #     on_delete=models.DO_NOTHING,
    #     related_name='report_persons_responsible',
    #     db_comment="if applicable, the contact record this information was pulled from",
    #     blank=True,
    #     null=True,
    # )
    street_address = models.CharField(
        max_length=255,
        db_comment="The street address of the contact.",
    )
    municipality = models.CharField(
        max_length=255,
        db_comment="The municipality of the contact.",
    )
    province = models.CharField(
        max_length=100,
        db_comment="The province of the contact.",
    )
    postal_code = models.CharField(
        max_length=20,
        db_comment="The postal code of the contact.",
    )
    business_role = models.CharField(
        max_length=255,
        db_comment="The business role of the contact.",
    )

    class Meta:
        db_table_comment = "A table to store the data about the person responsible for the report"
        db_table = 'erc"."report_person_responsible'
        app_label = 'reporting'
