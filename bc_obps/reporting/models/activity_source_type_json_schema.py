from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, Configuration
import typing
from reporting.utils import validate_overlapping_records
from reporting.models.rls_configs.activity_source_type_json_schema import Rls as ActivitySourceTypeJsonSchemaRls


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

    class Meta:
        db_table_comment = "Intersection table that assigns a json_schema as valid for a period of time given an activity-sourceType pair"
        db_table = 'erc"."activity_source_type_json_schema'

    Rls = ActivitySourceTypeJsonSchemaRls

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f"This record will result in duplicate json schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records"

        validate_overlapping_records(ActivitySourceTypeJsonSchema, self, exception_message)
        super().save(*args, **kwargs)
