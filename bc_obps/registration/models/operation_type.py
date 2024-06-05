from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class OperationType(BaseModel):
    """
    TODO: we need to make the type of operation a foreign key to this model(This needs a data migration to populate the operation type field in the operation model using this model)(A whole new ticket)
    """

    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of an operation type")
    history = HistoricalRecords(
        table_name='erc_history"."operation_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Operation types"
        db_table = 'erc"."operation_type'

    def __str__(self) -> str:
        return self.name
