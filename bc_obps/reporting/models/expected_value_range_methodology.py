from common.models import BaseModel
from django.db import models
from reporting.models import FuelType, GasType, Methodology
from reporting.models.rls_configs.expected_value_range_methodology import Rls as ExpectedValueRangeMethodologyRls


class ExpectedValueRangeMethodology(BaseModel):
    """Expected Value Range Fuel Amount model"""

    fuel_type = models.ForeignKey(
        FuelType,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology",
        db_comment="The fuel_type record that this value range applies to for the methodolgy value",
    )
    gas_type = models.ForeignKey(
        GasType,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology",
        db_comment="The gas_type record that this value range applies to for the methodology value",
    )
    methodology = models.ForeignKey(
        Methodology,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology",
        db_comment="The methodology record that this value range applies to for the methodology value",
    )
    lower_bound = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=0,
        db_comment="The lower bound of the value range for the related methodology. The reported methodology value should not be lower than this value",
    )
    upper_bound = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        db_comment="The upper bound of the value range for the related methodology. The reported methodology value should not be greater than this value",
    )
    valid_from = models.DateField(
        db_comment="The date this range bound record took effect",
    )
    valid_to = models.DateField(
        db_comment="The last date this range bound record was in effect",
    )

    class Meta:
        db_table_comment = "This table contains the expected range of values by fuel_type, gas_type and methodology that a reported methodology value should fall within. Values reported outside of these bounds are to be considered extraordinary and should be reviewed."
        db_table = 'erc"."expected_value_range_methodology'

    Rls = ExpectedValueRangeMethodologyRls
