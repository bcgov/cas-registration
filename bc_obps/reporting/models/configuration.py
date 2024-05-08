from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class Configuration(BaseModel):
    """Reporting gas type"""

    slug = models.CharField(max_length=1000, db_comment="Unique identifier for a configuration", unique=True)
    valid_from = models.DateField(blank=True, null=True, db_comment="Date from which the configuration is applicable")
    valid_to = models.DateField(blank=True, null=True, db_comment="Date until which the configuration is applicable")

    class Meta:
        db_table_comment = "Table containing program configurations for a date range"
        db_table = 'erc"."configuration'
