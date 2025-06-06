import typing
from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from django.core.cache import cache
from registration.enums.enums import RegistrationTableNames
from registration.models.rls_configs.regulated_product import Rls as RegulatedProductRls


class RegulatedProduct(BaseModel):
    name = models.CharField(max_length=1000, db_comment="The name of a regulated product")
    unit = models.CharField(max_length=1000, default="N/A", db_comment="The unit of measure for a regulated product")
    is_regulated = models.BooleanField(db_comment="Indicates if a product is regulated")
    history = HistoricalRecords(
        table_name='erc_history"."regulated_product_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = 'Table containing regulated and unregulated products. Regulated product means a product listed in column 2 of Table 2 of Schedule A.1 of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015. Unregulated products have been added to the dataset to assist in grouping some unregulated emissions for further analysis.'
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.REGULATED_PRODUCT.value}'
        constraints = [
            models.UniqueConstraint(
                fields=["name", "unit"],
                name="unique_product_on_name_unit",
            )
        ]

    Rls = RegulatedProductRls

    def __str__(self) -> str:
        return self.name

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the regulated product is saved.
        """
        cache.delete('regulated_products')
        super().save(*args, **kwargs)
