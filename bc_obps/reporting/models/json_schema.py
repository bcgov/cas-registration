from common.models import BaseModel
from django.db import models


class JsonSchema(BaseModel):
    """Static base json schema for emissions reporting forms"""

    # No history needed, these elements are immutable
    slug = models.CharField(
        max_length=1000,
        db_comment="Name of the schema. The activity & the related data object should be sufficient to identify it. For example: gsc_co2_2024 (general_stationary_combusion_co2 would be the co2 schema for within gsc)",
    )
    schema = models.JSONField(
        db_comment="The json schema for a form object. This schema defines the fields to be collected for a data object (activity, source_type, unit, fuel, gas_type, methodology)",
    )

    class Meta:
        db_table_comment = (
            "This table contains the json schema data for displaying the components of an emission form by activity."
        )
        db_table = 'erc"."json_schema'
