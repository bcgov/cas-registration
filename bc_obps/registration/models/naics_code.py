import typing
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from django.core.cache import cache


class NaicsCode(BaseModel):
    naics_code = models.CharField(max_length=1000, db_comment="NAICS code")
    naics_description = models.CharField(max_length=1000, db_comment="Description of the NAICS code")
    history = HistoricalRecords(
        table_name='erc_history"."naics_code_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table contains NAICS codes & their descriptions. NAICS code means the 6-digit code applicable to one or more producing units within a reporting operation under the North American Industrial Classification System (NAICS) Canada, 2007, published by Statistics Canada. Operations can have more than one NAICS code. More information, including version history for NAICS codes can be found at https://www.statcan.gc.ca/en/concepts/industry."
        db_table = 'erc"."naics_code'

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the NAICS code is saved.
        """
        cache.delete('naics_codes')
        super().save(*args, **kwargs)
