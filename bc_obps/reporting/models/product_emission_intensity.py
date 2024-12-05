from common.models import BaseModel
from django.db import models
from registration.models import RegulatedProduct
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import (
    DateTimeRangeField,
    RangeBoundary,
    RangeOperators,
)


class TsTzRange(models.Func):
    function = "DATERANGE"
    output_field = DateTimeRangeField()


class ProductEmissionIntensity(BaseModel):
    """Reporting Product Emission Intensity model"""

    product = models.ForeignKey(
        RegulatedProduct,
        on_delete=models.DO_NOTHING,
        related_name="%(class)s",
        db_comment="Foreign key to the product record that the emission intensity values in this record relate to",
    )
    product_weighted_average_emission_intensity = models.DecimalField(
        db_comment='The published B.C. productionweighted average emission intensity (PWAEI) for that product found in Schedule A.1 of the GGERR. https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleA',
        decimal_places=4,
        max_digits=10,
    )
    valid_from = models.DateField(
        blank=True, null=True, db_comment="Date from which the emission intensity value is applicable to a product"
    )
    valid_to = models.DateField(
        blank=True, null=True, db_comment="Date until which the emission intensity value is applicable to a product"
    )

    class Meta:
        db_table_comment = "This table contains the emission intensity value of a product and the from/to date values that the emission intesity is valid for that product."
        db_table = 'erc"."product_emission_intensity'
        constraints = [
            ExclusionConstraint(
                name="exclude_overlapping_emission_intensity_records_by_date_range",
                expressions=[
                    (TsTzRange("valid_from", "valid_to", RangeBoundary()), RangeOperators.OVERLAPS),
                    ("product", RangeOperators.EQUAL),
                ],
            ),
        ]
