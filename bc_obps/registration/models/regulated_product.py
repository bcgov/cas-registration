import typing
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from django.core.cache import cache


class RegulatedProduct(BaseModel):
    name = models.CharField(max_length=1000, db_comment="The name of a regulated product")
    unit = models.CharField(max_length=1000, blank=True, db_comment="The unit of measure for the regulated product")
    is_regulated = models.BooleanField(db_comment="Indicates if the product is regulated")
    history = HistoricalRecords(
        table_name='erc_history"."regulated_product_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing the names of regulated products. Regulated product means a product listed in column 2 of Table 2 of Schedule A.1 of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015."
        db_table = 'erc"."regulated_product'

    def __str__(self) -> str:
        return self.name

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the regulated product is saved.
        """
        cache.delete('regulated_products')
        super().save(*args, **kwargs)
