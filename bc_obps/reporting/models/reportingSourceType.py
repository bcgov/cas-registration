from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class ReportingSourceType(BaseModel):
    """Reporting source type model"""

    name = models.CharField(max_length=1000, db_comment="The name of a reporting source type")
    history = HistoricalRecords(
        table_name='erc_history"."reporting_source_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Reporting source types"
        db_table = 'erc"."reporting_source_type'
