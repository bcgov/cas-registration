import uuid
from registration.models import BaseModel
from django.db import models


class SourceType(BaseModel):
    """Reporting source type model"""

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, db_comment="Unique ID for the source type"
    )
    name = models.CharField(max_length=1000, db_comment="The name of a source type")

    class Meta:
        db_table_comment = "Source types"
        db_table = 'erc"."source_type'
