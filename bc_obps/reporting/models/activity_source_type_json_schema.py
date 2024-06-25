from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import SourceType, JsonSchema, Configuration
import typing
from reporting.utils import validate_overlapping_records


class ActivitySourceTypeJsonSchema(BaseModel):
    """Intersection table for Activity-SourceType-JsonSchema"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(
        ReportingActivity, on_delete=models.DO_NOTHING, related_name="activity_source_type_json_schemas"
    )
    source_type = models.ForeignKey(
        SourceType, on_delete=models.DO_NOTHING, related_name="activity_source_type_json_schemas"
    )
    json_schema = models.ForeignKey(
        JsonSchema, on_delete=models.DO_NOTHING, related_name="activity_source_type_json_schemas"
    )
    has_unit = models.BooleanField(
        db_comment="Whether or not this source type should collect unit data. If true, add a unit schema when buidling the form object", default=True
    )
    has_fuel = models.BooleanField(
        db_comment="Whether or not this source type should collect fuel data. If true, add a fuel schema when buidling the form object", default=True
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Intersection table that assigns a json_schema as valid for a period of time given an activity-sourceType pair"
        db_table = 'erc"."activity_source_type_json_schema'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f'This record will result in duplicate json schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'
        validate_overlapping_records(ActivitySourceTypeJsonSchema, self, exception_message)
        super().save(*args, **kwargs)