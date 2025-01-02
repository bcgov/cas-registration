from common.models import BaseModel
from django.db import models
from rls.utils import RlsGrant, RlsPolicy
from rls.enums import RlsRoles, RlsOperations


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

    class Rls:
        schema = 'erc'
        table = 'emission_category'
        enable_rls = True
        has_m2m = False
        grants = [
            RlsGrant(role=RlsRoles.INDUSTRY_USER, grants=[RlsOperations.SELECT], table="emission_category"),
            RlsGrant(
                role=RlsRoles.CAS_ADMIN, grants=[RlsOperations.SELECT, RlsOperations.INSERT], table="emission_category"
            ),
        ]
        policies = [
            RlsPolicy(
                role=RlsRoles.INDUSTRY_USER,
                policy_name="emission_category_industry_select",
                operation=RlsOperations.SELECT,
                using_statement="(id < 4)",
                table="emission_category",
            )
        ]
