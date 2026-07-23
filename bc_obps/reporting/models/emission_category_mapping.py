from common.models import BaseModel
from django.db import models
from registration.models import Activity
from reporting.models import SourceType, EmissionCategory
from reporting.models.rls_configs.emission_category_mapping import Rls as EmissionCategoryMappingRls


class EmissionCategoryMapping(BaseModel):
    """Emission Category Mapping model"""

    emission_category = models.ForeignKey(
        EmissionCategory,
        on_delete=models.DO_NOTHING,
        related_name="emission_category_mappings",
        db_comment="Emission category that defines a reported emission as defined in the Greenhouse Gas Reporting Regulation Schedule A. Foreign key to erc.emission_category table",
    )
    activity = models.ForeignKey(
        Activity,
        on_delete=models.DO_NOTHING,
        related_name="emission_category_mappings",
        db_comment="Activity that this emission is reported under. Foreign key to erc.activity table",
    )
    source_type = models.ForeignKey(
        SourceType,
        on_delete=models.DO_NOTHING,
        related_name="emission_category_mappings",
        db_comment="Source type that this emission is reported under. Foreign key to erc.source_type table",
    )

    class Meta:
        db_table_comment = "This table contains the set of rules for applying an emission category to an emission based on the activity & source type the emission was reported under."
        db_table = 'erc"."emission_category_mapping'

    Rls = EmissionCategoryMappingRls
