from registration.models.activity import Activity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.emission_category_mapping import EmissionCategoryMapping


class EmissionCategoryMappingService:
    """
    Service that applies an emission category to an emission based on the reported activity, source_type and in the case of fuel_excluded categories, fuel_classification
    """

    @staticmethod
    def apply_emission_categories(
        report_source_type: ReportSourceType,
        report_fuel: ReportFuel | None,
        report_emission: ReportEmission,
        methodology_data: dict,
    ) -> None:
        categories_set = []
        activity_id = report_source_type.report_activity.activity.id
        source_type_id = report_source_type.source_type.id
        basic = EmissionCategoryMapping.objects.get(
            activity_id=activity_id, source_type_id=source_type_id, emission_category__category_type='basic'
        ).emission_category.id
        categories_set.append(basic)

        if report_fuel:
            fuel_classification = report_fuel.fuel_type.classification
            fuel_excluded = EmissionCategoryMapping.objects.filter(
                activity_id=activity_id, source_type_id=source_type_id, emission_category__category_type='fuel_excluded'
            )
            if fuel_excluded:
                if fuel_classification == 'Woody Biomass':
                    categories_set.append(
                        fuel_excluded.get(
                            emission_category__category_name='CO2 emissions from excluded woody biomass'
                        ).emission_category.id
                    )
                if fuel_classification == 'Other Exempted Biomass':
                    categories_set.append(
                        fuel_excluded.get(
                            emission_category__category_name='Other emissions from excluded biomass'
                        ).emission_category.id
                    )
                if fuel_classification == 'Exempted Non-biomass':
                    categories_set.append(
                        fuel_excluded.get(
                            emission_category__category_name='Emissions from excluded non-biomass'
                        ).emission_category.id
                    )
        other = EmissionCategoryMapping.objects.filter(
            activity_id=activity_id, source_type_id=source_type_id, emission_category__category_type='other_excluded'
        ).first()

        if other:
            categories_set.append(other.emission_category.id)
        if EmissionCategoryMappingService.is_pulp_and_paper_woody_biomass(activity_id, methodology_data):
            categories_set.append(
                EmissionCategoryMapping.objects.get(
                    activity_id=activity_id,
                    source_type_id=source_type_id,
                    emission_category__category_name='CO2 emissions from excluded woody biomass',
                ).emission_category.id
            )

        report_emission.emission_categories.set(categories_set)

    @staticmethod
    def is_pulp_and_paper_woody_biomass(activity_id: int, methodology_data: dict) -> bool:
        activity = Activity.objects.filter(id=activity_id).first()
        if activity and activity.slug == 'pulp_and_paper':
            if methodology_data['methodology'] in ['Solids-HHV', 'Solids-CC']:
                return True
            elif methodology_data['methodology'] in [
                'Alternative Parameter Measurement Methodology',
                'Replacement Methodology',
            ]:
                if methodology_data.get('isWoodyBiomass', False):
                    return True
        return False
