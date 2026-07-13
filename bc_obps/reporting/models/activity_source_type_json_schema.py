from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, Configuration
from reporting.models.rls_configs.activity_source_type_json_schema import Rls as ActivitySourceTypeJsonSchemaRls
from reporting.models.triggers import no_overlapping_configuration_records_trigger


class ActivitySourceTypeJsonSchema(BaseModel):
    """Intersection table for Activity-SourceType-JsonSchema"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(
        Activity,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="The identifier for the activity type the schema is referencing. Foreign key to the erc.activity table",
    )
    source_type = models.ForeignKey(
        SourceType,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="The identifier for the source type the schema is referencing. Foreign key to the erc.source_type table",
    )
    json_schema = models.JSONField(
        db_comment="The json schema for a specific activity-source type pair. This defines the shape of the data collected for the source type. Each table with the prefix report_* and json_data captures a related subsection of this schema. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
    )
    has_unit = models.BooleanField(
        db_comment="Whether or not this source type should collect unit data. If true, add a unit schema when buidling the form object",
        default=True,
    )
    has_fuel = models.BooleanField(
        db_comment="Whether or not this source type should collect fuel data. If true, add a fuel schema when buidling the form object",
        default=True,
    )
    valid_from = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="The configuration record that defines the start of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table",
    )
    valid_to = models.ForeignKey(
        Configuration,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="The configuration record that defines the end of the valid period for the corresponding reporting year. Foreign key to the erc.configuration table",
    )

    class Meta:
        db_table_comment = "Intersection table that assigns a json_schema as valid for a period of time given an activity-sourceType pair"
        db_table = 'erc"."activity_source_type_json_schema'
        triggers = [
            no_overlapping_configuration_records_trigger(
                message="This record will result in duplicate json schemas being returned for the date range % - % as it overlaps with a current record or records",
                additional_filters=["source_type"],
            ),
        ]

    Rls = ActivitySourceTypeJsonSchemaRls
