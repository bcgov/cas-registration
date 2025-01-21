from ninja import ModelSchema, Schema
from reporting.models import EmissionCategory
from decimal import Decimal


class EmissionCategorySchema(ModelSchema):
    """
    Schema for the Emission Category model
    """

    class Meta:
        model = EmissionCategory
        fields = ["id", "category_name", "category_type"]


class BasicEmissionCategoriesSchema(Schema):
    """
    Schema for the get basic emission categories endpoint request output
    """

    flaring: Decimal | int
    fugitive: Decimal | int
    industrial_process: Decimal | int
    onsite_transportation: Decimal | int
    stationary_combustion: Decimal | int
    venting_useful: Decimal | int
    venting_non_useful: Decimal | int
    waste: Decimal | int
    wastewater: Decimal | int


class FuelExcludedEmissionCategoriesSchema(Schema):
    """
    Schema for the get fuel excluded emission categories endpoint request output
    """

    woody_biomass: Decimal | int
    excluded_biomass: Decimal | int
    excluded_non_biomass: Decimal | int


class OtherExcludedEmissionCategoriesSchema(Schema):
    """
    Schema for the get other excluded emission categories endpoint request output
    """

    lfo_excluded: Decimal | int
    fog_excluded: Decimal | int


class EmissionSummarySchemaOut(Schema):
    """
    Schema for the get emission summary endpoint request output
    """

    attributable_for_reporting: Decimal | int
    attributable_for_reporting_threshold: Decimal | int
    reporting_only_emission: Decimal | int
    emission_categories: BasicEmissionCategoriesSchema
    fuel_excluded: FuelExcludedEmissionCategoriesSchema
    other_excluded: OtherExcludedEmissionCategoriesSchema
