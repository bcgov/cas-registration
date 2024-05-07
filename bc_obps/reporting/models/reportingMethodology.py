from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class ReportingMethodology(BaseModel):
    """Reporting methodology"""

    name = models.CharField(max_length=1000, db_comment="The name of a reporting methodology")
    history = HistoricalRecords(
        table_name='erc_history"."reporting_methodology_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Reporting methodologies"
        db_table = 'erc"."reporting_methodology'
