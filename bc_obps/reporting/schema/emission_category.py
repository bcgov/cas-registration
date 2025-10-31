from ninja import ModelSchema, Schema
from reporting.models import EmissionCategory


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

    flaring: float
    fugitive: float
    industrial_process: float
    onsite_transportation: float
    stationary_combustion: float
    venting_useful: float
    venting_non_useful: float
    waste: float
    wastewater: float


class FuelExcludedEmissionCategoriesSchema(Schema):
    """
    Schema for the get fuel excluded emission categories endpoint request output
    """

    woody_biomass: float
    excluded_biomass: float
    excluded_non_biomass: float


class OtherExcludedEmissionCategoriesSchema(Schema):
    """
    Schema for the get other excluded emission categories endpoint request output
    """

    lfo_excluded: float
    fog_excluded: float


class EmissionSummarySchemaOut(Schema):
    """
    Schema for the get emission summary endpoint request output
    """

    attributable_for_reporting: float
    attributable_for_reporting_threshold: float
    reporting_only_emission: float
    emission_categories: BasicEmissionCategoriesSchema
    fuel_excluded: FuelExcludedEmissionCategoriesSchema
    other_excluded: OtherExcludedEmissionCategoriesSchema
