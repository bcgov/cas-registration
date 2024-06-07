from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class DocumentType(BaseModel):
    name = models.CharField(
        max_length=1000,
        db_comment="Name of document type (e.g. opt in signed statutory declaration)",
    )
    history = HistoricalRecords(
        table_name='erc_history"."document_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table that contains types of documents."
        db_table = 'erc"."document_type'
