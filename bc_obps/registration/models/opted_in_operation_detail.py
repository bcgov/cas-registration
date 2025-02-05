from django.db import models
from registration.models import TimeStampedModel
from simple_history.models import HistoricalRecords


class OptedInOperationDetail(TimeStampedModel):
    meets_section_3_emissions_requirements = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Does this operation have emissions that are attributable for the purposes of section 3 of the Act?",
    )
    meets_electricity_import_operation_criteria = models.BooleanField(
        blank=True, null=True, db_comment="Is this operation an electricity import operation?"
    )
    meets_entire_operation_requirements = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Designation as an opt-in can only be granted to an entire operation (i.e. not a part or certain segment of an operation). Do you confirm that the operation applying for this designation is an entire operation?",
    )
    meets_section_6_emissions_requirements = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Does this operation have emissions that are attributable for the purposes of section 6 of the Act?",
    )
    meets_naics_code_11_22_562_classification_requirements = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Is this operation's primary economic activity classified by the following NAICS Code - 11, 22, or 562?",
    )
    meets_producing_gger_schedule_a1_regulated_product = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Does this operation produce a regulated product listed in Table 2 of Schedule A.1 of the GGERR?",
    )
    meets_reporting_and_regulated_obligations = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Is this operation capable of fulfilling the obligations of a reporting operation and a regulated operation under the Act and the regulations?",
    )
    meets_notification_to_director_on_criteria_change = models.BooleanField(
        blank=True,
        null=True,
        db_comment="Will the operator notify the Director as soon as possible if this operation ceases to meet any of the criteria for the designation of the operation as a reporting operation and a regulated operation?",
    )
    history = HistoricalRecords(
        table_name='erc_history"."opted_in_operation_detail_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing details about operations that have opted in"
        db_table = 'erc"."opted_in_operation_detail'
