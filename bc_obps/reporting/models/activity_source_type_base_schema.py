from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity
from reporting.models import SourceType, BaseSchema, Configuration
from django.db.models.constraints import UniqueConstraint


class ActivitySourceTypeBaseSchema(BaseModel):
    """Configuration element for reporting"""

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
        db_table = 'erc"."configuration_element'
        constraints = [
            UniqueConstraint(
                fields=[
                    'reporting_activity',
                    'source_type',
                    'base_schema'
                    'valid_from',
                    'valid_to',
                ],
                name='unique_per_acivity_source_type_base_schema',
            )
        ]
