from common.models import BaseModel
from django.db import models
from reporting.models import FuelType, Methodology, ReportingField
from reporting.models.rls_configs.expected_value_range_methodology_field import (
    Rls as ExpectedValueRangeMethodologyFieldRls,
)


class ExpectedValueRangeMethodologyField(BaseModel):
    """Expected Value Range Methodology Field model"""

    fuel_type = models.ForeignKey(
        FuelType,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology_field",
        db_comment="The fuel_type record that this value range applies to for the methodology field value. Foreign key to erc.fuel_type table",
    )
    methodology = models.ForeignKey(
        Methodology,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology_field",
        db_comment="The methodology record that this value range applies to for the methodology field value. Foreign key to erc.methodology table",
    )
    reporting_field = models.ForeignKey(
        ReportingField,
        on_delete=models.CASCADE,
        related_name="expected_value_range_methodology_field",
        db_comment="The reporting_field record that this value range applies to for the methodology field value. Foreign key to erc.reporting_field table",
    )
    lower_bound = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=0,
        db_comment="The lower bound of the value range for the related methodology field. The reported methodology field value should not be lower than this value",
    )
    upper_bound = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        db_comment="The upper bound of the value range for the related methodology field. The reported methodology field value should not be greater than this value",
    )
    valid_from = models.DateField(
        db_comment="The date this range bound record took effect",
    )
    valid_to = models.DateField(
        db_comment="The last date this range bound record was in effect",
    )

    class Meta:
        db_table_comment = "This table contains the expected range of values by fuel_type, methodology and reporting_field that a reported methodology field value should fall within. Values reported outside of these bounds are to be considered extraordinary and should be reviewed."
        db_table = 'erc"."expected_value_range_methodology_field'

    Rls = ExpectedValueRangeMethodologyFieldRls
