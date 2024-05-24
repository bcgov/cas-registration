from django.db import models
from registration.models import BaseModel
import uuid


class Report(models.Model):
    title = models.CharField(max_length=100, db_comment="The title of the report")
    description = models.TextField(db_comment="The description of the report")
    created_at = models.DateTimeField(auto_now_add=True, db_comment="The timestamp when the report was created")

    class Meta:
        db_table_comment = "A table to store reports"
        db_table = 'erc"."report'
        app_label = 'reporting'

    def __str__(self) -> str:
        return self.title


class SourceType(BaseModel):
    """Reporting source type model"""

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, db_comment="Unique ID for the source type"
    )
    name = models.CharField(max_length=1000, db_comment="The name of a source type")

    class Meta:
        db_table_comment = "Source types"
        db_table = 'erc"."source_type'
