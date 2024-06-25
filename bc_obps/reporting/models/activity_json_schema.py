from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import JsonSchema, Configuration
import typing
from reporting.utils import validate_overlapping_records


class ActivityJsonSchema(BaseModel):
    """Intersection table for Activity-JsonSchema"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(
        ReportingActivity, on_delete=models.DO_NOTHING, related_name="activity_json_schemas"
    )
    json_schema = models.ForeignKey(JsonSchema, on_delete=models.DO_NOTHING, related_name="activity_json_schemas")
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = (
            "Intersection table that assigns a json_schema as valid for a period of time given an activity"
        )
        db_table = 'erc"."activity_json_schema'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        exception_message = f'This record will result in duplicate json schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records'
        validate_overlapping_records(ActivityJsonSchema, self, exception_message)
        super().save(*args, **kwargs)
