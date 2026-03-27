from common.models import BaseModel
from django.db import models
from reporting.models import FuelType
from reporting.models.rls_configs.expected_value_range_fuel_amount import Rls as ExpectedValueRangeFuelAmountRls


class ExpectedValueRangeFuelAmount(BaseModel):
    """Expected Value Range Fuel Amount model"""

    fuel_type = models.ForeignKey(
        FuelType,
        on_delete=models.CASCADE,
        related_name="expected_value_range_fuel_amount",
        db_comment="The fuel type record that this value range applies to for the fuel_amount value",
    )
    lower_bound = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        db_comment="The lower bound of the value range for the related fuel type. The reported fuel_amount value should not be lower than this value"
    )
    upper_bound = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        db_comment="The upper bound of the value range for the related fuel type. The reported fuel_amount value should not be greater than this value"
    )
    valid_from = models.DateField(
        db_comment="The date this range bound record took effect",
    )
    valid_to = models.DateField(
        db_comment="The last date this range bound record was in effect",
    )

    class Meta:
        db_table_comment = (
            "This table contains the expected range of values by fuel_type that a reported fuel_type value should fall within. Values reported outside of these bounds are to be considered extraordinary and should be reviewed."
        )
        db_table = 'erc"."expected_value_range_fuel_amount'

    Rls = ExpectedValueRangeFuelAmountRls
