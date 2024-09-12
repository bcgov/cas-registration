from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import Configuration


class CustomMethodologySchema(BaseModel):
    """Custom schema for a methodology."""

    json_schema = models.JSONField()
    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="+")
    valid_from = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")
    valid_to = models.ForeignKey(Configuration, on_delete=models.DO_NOTHING, related_name="+")

    class Meta:
        db_table = 'erc"."custom_methodology_schema'
        db_table_comment = "Custom methodology schema used to define additional fields for reporting"
