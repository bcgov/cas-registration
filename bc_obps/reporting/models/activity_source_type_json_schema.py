from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, Configuration
from reporting.models.rls_configs.activity_source_type_json_schema import Rls as ActivitySourceTypeJsonSchemaRls
from reporting.models.triggers import no_overlapping_configuration_records_trigger
from typing import cast
from datetime import date as date_type


class ActivitySourceTypeJsonSchemaManager(models.Manager):
    def get_by_date(
        self, activity: Activity, source_type: SourceType, date: date_type
    ) -> "ActivitySourceTypeJsonSchema":
        """Return the schema valid for the given activity, source type, and date"""
        return cast(
            "ActivitySourceTypeJsonSchema",
            self.get(
                activity=activity,
                source_type=source_type,
                valid_from__valid_from__lte=date,
                valid_to__valid_to__gte=date,
            ),
        )


class ActivitySourceTypeJsonSchema(BaseModel):
    """Intersection table for Activity-SourceType-JsonSchema"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="+")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="+")
    json_schema = models.JSONField(
        db_comment="The json schema for a specific activity-source type pair. This defines the shape of the data collected for the source type",
    )
    has_unit = models.BooleanField(
        db_comment="Whether or not this source type should collect unit data. If true, add a unit schema when buidling the form object",
        default=True,
    )
    has_fuel = models.BooleanField(
        db_comment="Whether or not this source type should collect fuel data. If true, add a fuel schema when buidling the form object",
        default=True,
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    objects = ActivitySourceTypeJsonSchemaManager()

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
