from django.db import models

from registration.models.time_stamped_model import TimeStampedModel
from registration.models.user_and_contact_common_info import UserAndContactCommonInfo
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger


class ReportPersonResponsible(UserAndContactCommonInfo, TimeStampedModel):
    report_version = models.OneToOneField(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_person_responsible",
        db_comment="The report version this person responsible applies to",
    )
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

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store the data about the person responsible for the report"
        db_table = 'erc"."report_person_responsible'
        app_label = "reporting"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
