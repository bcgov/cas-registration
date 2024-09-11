from django.db import models
from common.models import BaseModel


class CustomMethodologySchema(BaseModel):
    """Custom schema for a methodology."""

    name = models.CharField(max_length=255)
    json_schema = models.JSONField()

    class Meta:
        db_table = 'erc"."custom_methodology_schema'
        db_table_comment = "Custom methodology schema used to define additional fields for reporting"
