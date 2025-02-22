from common.models import BaseModel
from django.db import models
from reporting.models.rls_configs.fuel_type import Rls as FuelTypeRls


class FuelType(BaseModel):
    """Reporting fuel type model"""

    name = models.CharField(max_length=1000, db_comment="The name of a fuel type (example: Crude Oil)")
    unit = models.CharField(
        max_length=1000,
        db_comment="The unit of measurement for this fuel type (example: kilolitres)",
    )
    classification = models.CharField(
        max_length=1000,
        db_comment="The classification (biomass/non-biomass & exempted/non-exempted) applied to the fuel as determined by GGERR Schedule C (https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleC)",
    )

    class Meta:
        db_table_comment = "This table contains the list of fuel types that can be reported."
        db_table = 'erc"."fuel_type'

    Rls = FuelTypeRls
