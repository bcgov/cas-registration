from registration.models import BaseModel
from django.db import models


class BaseSchema(BaseModel):
    """Static base json schema for emissions reporting forms"""

    # No history needed, these elements are immutable
    slug = models.CharField(max_length=1000, db_comment="Name of the base schema. Should describe what form it is used to generate and when the base schema took effect. For example: general_stationary_combustion_2024")
    schema = models.JSONField(max_length=100000, db_comment="The base json schema for a form. This schema defines the static set of fields that should be shown on a form, static meaning that they do not dynamically change based on user input.")

    class Meta:
        db_table_comment = "This table contains the base json schema data for displaying emission forms. The base schema can be defined by activity and source type and does not change based on user input so it can be stored statically"
        db_table = 'erc"."base_schema'
