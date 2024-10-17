from common.models import BaseModel
from django.db import models


class EmissionCategory(BaseModel):
    """Emission Category model"""

    class EmissionCategoryType(models.TextChoices):
        BASIC = "basic"
        FUEL_EXCLUDED = "fuel_excluded"
        OTHER_EXCLUDED = "other_excluded"

    category_name = models.CharField(
        max_length=1000,
        db_comment="The name of the emission category as defined in the Greenhouse Gas Emission Reporting Regulation)",
    )
    category_type = models.CharField(
        max_length=1000,
        choices=EmissionCategoryType.choices,
        db_comment="Type of category defines how it is applied. Basic categories are mandatory and do not overlap with each other. fuel_excluded is dependent on which fuel was consumed & may overlap with basic categories. Other exlcluded have special rules as to when an emission should have this category applied.",
    )

    class Meta:
        db_table_comment = (
            "This table contains the set of emission categories that greenhouse gas emissions can be counted under."
        )
        db_table = 'erc"."emission_category'
