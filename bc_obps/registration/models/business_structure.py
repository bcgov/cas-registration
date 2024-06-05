import typing
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from django.core.cache import cache


class BusinessStructure(BaseModel):
    """The business structure of an operator"""

    name = models.CharField(primary_key=True, max_length=1000, db_comment="The name of a business structure")
    history = HistoricalRecords(
        table_name='erc_history"."business_structure_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing operator business structures. Business structure refers to the legal and organizational framework under which a business operates (e.g., partnership, sole proprietorship, corporation, limited liability company)."
        db_table = 'erc"."business_structure'

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when the business structure is saved.
        """
        cache.delete('business_structures')
        super().save(*args, **kwargs)
