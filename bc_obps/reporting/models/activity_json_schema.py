from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import Configuration
from reporting.models.rls_configs.activity_json_schema import Rls as ActivityJsonSchemaRls
from reporting.models.triggers import no_overlapping_configuration_records_trigger


class ActivityJsonSchema(BaseModel):
    """Intersection table for Activity-JsonSchema"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(
        Activity,
        on_delete=models.DO_NOTHING,
        related_name="+",
        db_comment="The identifier for the activity type the schema is referencing. Foreign key to the erc.activity table",
    )
    json_schema = models.JSONField(
        db_comment="The json schema for a specific activity. This defines the shape of the data collected for the related activity",
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
        db_table_comment = (
            "Intersection table that assigns a json_schema as valid for a period of time given an activity"
        )
        db_table = 'erc"."activity_json_schema'
        triggers = [
            no_overlapping_configuration_records_trigger(
                message="This record will result in duplicate json schemas being returned for the date range % - % as it overlaps with a current record or records",
            ),
        ]

    Rls = ActivityJsonSchemaRls
