from common.models import BaseModel
from django.db import models


class SourceType(BaseModel):
    """Reporting source type model"""

    name = models.CharField(max_length=1000, db_comment="The name of a source type")

    class Meta:
        db_table_comment = "Source types"
        db_table = 'erc"."source_type'
