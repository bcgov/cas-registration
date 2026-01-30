from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import Configuration
from reporting.models.rls_configs.activity_json_schema import Rls as ActivityJsonSchemaRls


class ActivityJsonSchema(BaseModel):
    """Intersection table for Activity-JsonSchema"""

    # No history needed, these elements are immutable
    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="+")
    json_schema = models.JSONField(
        db_comment="The json schema for a specific activity. This defines the shape of the data collected for the related activity",
    )
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table_comment = (
            "Intersection table that assigns a json_schema as valid for a period of time given an activity"
        )
        db_table = 'erc"."activity_json_schema'

    Rls = ActivityJsonSchemaRls
