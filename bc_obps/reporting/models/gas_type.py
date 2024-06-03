from registration.models import BaseModel
from django.db import models


class GasType(BaseModel):
    """Reporting gas type"""

    name = models.CharField(max_length=1000, db_comment="The name of a greenhouse gas type")
    def __str__(self) -> str:
        return self.name

    class Meta:
        db_table_comment = "This table contains the list of gas types that can be reported as defined in GGERR (Greenhous Gas Emission Reporting Regulation)"
        db_table = 'erc"."gas_type'
