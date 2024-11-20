from django.db import transaction
from django.forms import model_to_dict

from registration.models import RegulatedProduct
from reporting.models import ReportVersion, ReportNewEntrant, ReportNewEntrantProduction, EmissionCategory
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn


class ReportNewEntrantService:
    @classmethod
    def get_new_entrant_data(cls, report_version_id: int) -> dict:
        # Fetch the report_new_entrant instance based on the provided report_version_id
        report_new_entrant = ReportNewEntrant.objects.filter(report_version_id=report_version_id).first()

        # Initialize result_data to an empty dictionary
        result_data = {}

        # If report_new_entrant is not found, use empty lists for selected_products and emissions
        if not report_new_entrant:
            result_data['selected_products'] = []
            result_data['emissions'] = [
                {
                    "id": category.id,
                    "category_name": category.category_name,
                    "category_type": category.category_type,
                    "emission_amount": None,  # Emission amount will be None since there's no report_new_entrant
                }
                for category in EmissionCategory.objects.all()
            ]
        else:
            # If report_new_entrant is found, get the corresponding data
            result_data = model_to_dict(report_new_entrant, exclude=['selected_products'])

            # Populate selected_products
            result_data['selected_products'] = [
                {
                    "product_name": production.product.name,
                    "production_amount": production.production_amount,
                    "product_id": production.product.id,
                }
                for production in report_new_entrant.productions.all()
            ]

            # Create a map for emissions based on report_new_entrant's emissions
            emissions_map = {
                emission.emission_category.id: emission.emission
                for emission in report_new_entrant.report_new_entrant_emissions.all()
            }

            # Populate emissions with data from EmissionCategory, using emissions_map for emission_amount
            result_data['emissions'] = [
                {
                    "id": category.id,
                    "category_name": category.category_name,
                    "category_type": category.category_type,
                    "emission_amount": emissions_map.get(category.id),  # This will be None if no emission data
                }
                for category in EmissionCategory.objects.all()
            ]

        return result_data

    @classmethod
    @transaction.atomic
    def save_new_entrant_data(
        cls,
        report_version_id: int,
        data: ReportNewEntrantSchemaIn,
    ) -> None:

        report_version = ReportVersion.objects.get(pk=report_version_id)

        entrant_data = {
            "authorization_date": data.date_of_authorization,
            "first_shipment_date": data.date_of_first_shipment,
            "new_entrant_period_start": data.date_of_new_entrant_period_began,
            "assertion_statement": data.assertion_statement,
            "flaring_emissions": data.emission_after_new_entrant.flaring_emissions,
            "fugitive_emissions": data.emission_after_new_entrant.fugitive_emissions,
            "industrial_process_emissions": data.emission_after_new_entrant.industrial_process_emissions,
            "on_site_transportation_emissions": data.emission_after_new_entrant.on_site_transportation_emissions,
            "stationary_fuel_combustion_emissions": data.emission_after_new_entrant.stationary_fuel_combustion_emissions,
            "venting_emissions_useful": data.emission_after_new_entrant.venting_emissions_useful,
            "venting_emissions_non_useful": data.emission_after_new_entrant.venting_emissions_non_useful,
            "emissions_from_waste": data.emission_after_new_entrant.emissions_from_waste,
            "emissions_from_wastewater": data.emission_after_new_entrant.emissions_from_wastewater,
            "co2_emissions_from_excluded_woody_biomass": data.emission_excluded_by_fuel_type.co2_emissions_from_excluded_woody_biomass,
            "other_emissions_from_excluded_biomass": data.emission_excluded_by_fuel_type.other_emissions_from_excluded_biomass,
            "emissions_from_excluded_non_biomass": data.emission_excluded_by_fuel_type.emissions_from_excluded_non_biomass,
            "emissions_from_line_tracing": data.other_excluded_emissions.emissions_from_line_tracing,
            "emissions_from_fat_oil": data.other_excluded_emissions.emissions_from_fat_oil,
        }

        report_new_entrant, _ = ReportNewEntrant.objects.update_or_create(
            report_version=report_version,
            defaults=entrant_data,
        )

        production_data = [
            {"product_id": product_id, "production_amount": details.production_amount}
            for product_id, details in data.products.items()
        ]

        product_ids = [entry["product_id"] for entry in production_data]
        allowed_products = RegulatedProduct.objects.filter(id__in=product_ids).values_list("id", flat=True)

        if not all(prod_id in allowed_products for prod_id in product_ids):
            raise ValueError("Invalid product IDs provided.")

        ReportNewEntrantProduction.objects.filter(report_new_entrant=report_new_entrant).exclude(
            product_id__in=product_ids
        ).delete()

        for prod_data in production_data:
            ReportNewEntrantProduction.objects.update_or_create(
                report_new_entrant=report_new_entrant,
                product_id=prod_data["product_id"],
                defaults={"production_amount": prod_data["production_amount"]},
            )
