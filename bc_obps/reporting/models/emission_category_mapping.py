from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, EmissionCategory
from reporting.models.rls_configs.emission_category_mapping import Rls as EmissionCategoryMappingRls


class EmissionCategoryMapping(BaseModel):
    """Emission Category Mapping model"""

    emission_category = models.ForeignKey(
        EmissionCategory, on_delete=models.DO_NOTHING, related_name="emission_category_mappings"
    )
    activity = models.ForeignKey(Activity, on_delete=models.DO_NOTHING, related_name="emission_category_mappings")
    source_type = models.ForeignKey(SourceType, on_delete=models.DO_NOTHING, related_name="emission_category_mappings")

    class Meta:
        db_table_comment = "This table contains the set of rules for applying an emission category to an emission based on the activity & source type the emission was reported under."
        db_table = 'erc"."emission_category_mapping'

    Rls = EmissionCategoryMappingRls
