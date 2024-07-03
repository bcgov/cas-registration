from common.models import BaseModel
from django.db import models


class FuelType(BaseModel):
    """Reporting fuel type model"""

    name = models.CharField(max_length=1000, db_comment="The name of a fuel type (example: Crude Oil)")
    unit_type = models.CharField(
        max_length=1000,
        db_comment="The unit of measurement for this fuel type (example: kilolitres)",
    )

    class Meta:
        db_table_comment = "This table contains the list of fuel types that can be reported."
        db_table = 'erc"."fuel_type'
