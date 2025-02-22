from common.models import BaseModel
from django.db import models
from reporting.models.rls_configs.gas_type import Rls as GasTypeRls


class GasType(BaseModel):
    """Reporting gas type"""

    name = models.CharField(max_length=1000, db_comment="The name of a greenhouse gas type (example: Carbon Dioxide)")
    chemical_formula = models.CharField(
        max_length=100, db_comment="The chemical formula representation of a greenhouse gast type (example: CO2)"
    )
    gwp = models.IntegerField(
        db_comment="GWP is the Global Warming Potential of a specific gas. The GWP value is used to convert gases into a CO2 equivalent value. For example, if CH4 gas has a gwp of 28, then 1 tonne of CH4 is equivalent to 28 tonnes of CO2 (CO2e). Source: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/392_2008#section6",
    )
    cas_number = models.CharField(
        db_comment="cas number is a unique value that identifes a gas_type (CO2, CH4...). https://www.cas.org/cas-data/cas-registry"
    )

    def __str__(self) -> str:
        return self.name

    class Meta:
        db_table_comment = "This table contains the list of gas types that can be reported as defined in GGERR (Greenhous Gas Emission Reporting Regulation)"
        db_table = 'erc"."gas_type'

    Rls = GasTypeRls
