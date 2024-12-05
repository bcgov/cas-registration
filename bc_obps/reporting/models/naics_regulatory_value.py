from common.models import BaseModel
from django.db import models
from registration.models import NaicsCode
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import (
    DateTimeRangeField,
    RangeBoundary,
    RangeOperators,
)


class TsTzRange(models.Func):
    function = "DATERANGE"
    output_field = DateTimeRangeField()


class NaicsRegulatoryValue(BaseModel):
    """Reporting Naics Regulatory Value model"""

    naics_code = models.ForeignKey(
        NaicsCode,
        on_delete=models.DO_NOTHING,
        related_name="regulatory_values",
        db_comment="Foreign key to the naics_code record that is associated with the regulatory values in this record",
    )
    reduction_factor = models.DecimalField(
        db_comment='The Province developed distinct reduction factors for products in the B.C. OBPS with disproportionately higher industrial process emissions than those produced in other sectors. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf',
        decimal_places=4,
        max_digits=5,
    )
    tightening_rate = models.DecimalField(
        db_comment='Tightening rates are planned, yearly, gradual increases to BC OBPS stringency. https://www2.gov.bc.ca/assets/gov/environment/climate-change/action/carbon-tax/obps-technical-backgrounder.pdf',
        decimal_places=4,
        max_digits=5,
    )
    valid_from = models.DateField(
        blank=True, null=True, db_comment="Date from which the regulatory values are applicable"
    )
    valid_to = models.DateField(
        blank=True, null=True, db_comment="Date until which the regulatory values are applicable"
    )

    class Meta:
        db_table_comment = "This table contains the regulatory values that apply to a naics code within a set timeframe from where the values are valid and when the values are no longer valid."
        db_table = 'erc"."naics_regulatory_values'
        constraints = [
            ExclusionConstraint(
                name="exclude_overlapping_naics_regulatory_values_records_by_date_range",
                expressions=[
                    (TsTzRange("valid_from", "valid_to", RangeBoundary()), RangeOperators.OVERLAPS),
                    ("naics_code", RangeOperators.EQUAL),
                ],
            ),
        ]
