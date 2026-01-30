from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, Configuration
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
