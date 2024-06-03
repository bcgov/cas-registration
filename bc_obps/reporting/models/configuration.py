from registration.models import BaseModel
from django.db import models


class Configuration(BaseModel):
    """Reporting configuration for a year/program state"""

    slug = models.CharField(max_length=1000, db_comment="Unique identifier for a configuration", unique=True)
    valid_from = models.DateField(blank=True, null=True, db_comment="Date from which the configuration is applicable")
    valid_to = models.DateField(blank=True, null=True, db_comment="Date until which the configuration is applicable")

    class Meta:
        db_table_comment = "Table containing program configurations for a date range. Each record will define a time period for when configuration elements are valid. When a change to the configuration is made a new configuration record will be created. This enables historical accuracy when applying configurations from previous years."
        db_table = 'erc"."configuration'
