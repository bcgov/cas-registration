from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class ReportingGasType(BaseModel):
    """Reporting gas type"""

    name = models.CharField(max_length=1000, db_comment="The name of a greenhouse gas type")
    def __str__(self) -> str:
        return self.name

    class Meta:
        db_table_comment = "This table contains the list of gas types that can be reported as defined in GGERR (Greenhous Gas Emission Reporting Regulation)"
        db_table = 'erc"."reporting_gas_type'
