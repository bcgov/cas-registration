from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import SourceType, BaseSchema, Configuration
from django.db.models import Q

import typing

class ActivitySourceTypeBaseSchema(BaseModel):
    """Intersection table for Activity-SourceType-BaseSchema"""

    # No history needed, these elements are immutable
    reporting_activity = models.ForeignKey(
        ReportingActivity, on_delete=models.DO_NOTHING, related_name="activity_source_type_base_schemas"
    )
    source_type = models.ForeignKey(
        SourceType, on_delete=models.DO_NOTHING, related_name="activity_source_type_base_schemas"
    )
    base_schema = models.ForeignKey(
        BaseSchema, on_delete=models.DO_NOTHING, related_name="activity_source_type_base_schemas"
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = "Intersection table that assigns a base_schema as valid for a period of time given an activity-sourceType pair"
        db_table = 'erc"."activity_source_type_base_schema'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to validate if there are overlapping records.
        """
        all_ranges = ActivitySourceTypeBaseSchema.objects.select_related('valid_from', 'valid_to').filter(
          reporting_activity=self.reporting_activity,
          source_type=self.source_type)
        for y in all_ranges:
            if (
                (self.valid_from.valid_from >= y.valid_from.valid_from) and (self.valid_from.valid_from <= y.valid_to.valid_to)
                or
                (self.valid_to.valid_to <= y.valid_to.valid_to) and (self.valid_to.valid_to >= y.valid_from.valid_from)
            ):
                raise Exception(f'This record will result in duplicate base schemas being returned for the date range {self.valid_from.valid_from} - {self.valid_to.valid_to} as it overlaps with a current record or records')
        super().save(*args, **kwargs)
