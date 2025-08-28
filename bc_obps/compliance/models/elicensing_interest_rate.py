from django.db import models
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import (
    DateRangeField,
    RangeBoundary,
    RangeOperators,
)
from common.models import BaseModel
from .rls_configs.elicensing_interest_rate import Rls as ElicensingInterestRateRls


class DateRange(models.Func):
    """Custom function for creating date ranges"""

    function = "DATERANGE"
    output_field = DateRangeField()


class ElicensingInterestRate(BaseModel):
    """
    Interest rate data synced with elicensing.
    """

    interest_rate = models.DecimalField(
        decimal_places=6,
        max_digits=6,
        db_comment="The interest rate from elicensing",
    )

    start_date = models.DateField(
        db_comment="The date that the rate took effect. Date is pulled from elicensing",
    )

    end_date = models.DateField(
        db_comment="The last date that the rate was in effect. Date is generated in BCIERS when a new interest rate record is pulled from elicensing. End date is one day before the start date of the new record.",
    )

    is_current_rate = models.BooleanField(
        default=False,
        db_comment="Indicates whether this rate is the rate currently in use",
    )

    class Meta:
        app_label = "compliance"
        db_table_comment = "Table contains the interest rate from elicensing"
        db_table = 'erc"."elicensing_interest_rate'
        constraints = [
            ExclusionConstraint(
                name="exclude_overlapping_interest_rate_periods",
                expressions=[
                    (DateRange("start_date", "end_date", RangeBoundary()), RangeOperators.OVERLAPS),
                ],
            ),
            models.UniqueConstraint(
                name="unique_current_rate",
                fields=['is_current_rate'],
                condition=models.Q(is_current_rate=True),
            ),
        ]

    Rls = ElicensingInterestRateRls
