from common.models import BaseModel
from django.db import models
from reporting.models.rls_configs.source_type import Rls as SoureTypeRls


class SourceType(BaseModel):
    """Reporting source type model"""

    name = models.CharField(max_length=1000, db_comment="The name of a source type")
    json_key = models.CharField(
        max_length=100,
        db_comment="A truncated and camel cased version on the source type name that is used as a key when building the json schema dynamically",
    )

    class Meta:
        db_table_comment = "Source types"
        db_table = 'erc"."source_type'
        constraints = [
            models.UniqueConstraint(
                fields=['json_key'],
                name='unique_source_type_json_key',
            )
        ]

    Rls = SoureTypeRls
