from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import Configuration, SourceType
import typing
from reporting.utils import validate_overlapping_records


class ActivitySourceTypeUnitJsonSchema(BaseModel):
    """Intersection table for Activity-SourceType-JsonSchema for Unit schemas"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(ReportingActivity, on_delete=models.DO_NOTHING, related_name="+")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="+")
    json_schema = models.JSONField(
        db_comment="The json schema for a specific unit within a source type. This defines the shape of the data collected for the related unit data in a source type",
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Intersection table that assigns a json_schema for a unit as valid for a period of time given an activity & source type"
        db_table = 'erc"."activity_source_type_unit_json_schema'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f'This record will result in duplicate json schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'
        validate_overlapping_records(ActivitySourceTypeUnitJsonSchema, self, exception_message)
        super().save(*args, **kwargs)
