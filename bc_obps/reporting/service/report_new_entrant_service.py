from typing import List, Dict, Optional, Any
from django.db import transaction
from django.forms import model_to_dict

from reporting.models import (
    ReportVersion,
    ReportNewEntrant,
    ReportNewEntrantProduction,
    EmissionCategory,
    ReportNewEntrantEmissions,
)
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn
from reporting.schema.report_regulated_products import RegulatedProductOut
from service.report_service import ReportService


class ReportNewEntrantService:
    @classmethod
    def get_new_entrant_data(cls, report_version_id: int) -> Dict[str, Any]:
        """Returns a dictionary containing products, emissions, and new entrant data."""
        report_new_entrant = ReportNewEntrant.objects.filter(report_version=report_version_id).first()

        regulated_products = ReportService.get_regulated_products_by_version_id(version_id=report_version_id)

        categories = list(EmissionCategory.objects.all())

        return cls._initialize_result_data(regulated_products, categories, report_new_entrant)

    @staticmethod
    def _initialize_result_data(
        regulated_products: List[RegulatedProductOut],
        categories: List[EmissionCategory],
        report_new_entrant: Optional[ReportNewEntrant],  # Change here
    ) -> Dict[str, Any]:
        """Helper to initialize the result data"""
        products_data = ReportNewEntrantService._get_products_data(regulated_products, report_new_entrant)
        emissions_data = ReportNewEntrantService._get_emissions_data(categories, report_new_entrant)
        result_data = (
            model_to_dict(report_new_entrant, exclude=["selected_products"]) if report_new_entrant is not None else {}
        )
        return {"products": products_data, "emissions": emissions_data, "new_entrant_data": result_data}

    @staticmethod
    def _get_products_data(
        regulated_products: List[RegulatedProductOut], report_new_entrant: Optional[ReportNewEntrant]  # Change here
    ) -> List[Dict[str, Optional[str]]]:
        """Helper to fetch product data"""
        productions_map = (
            {production.product.id: production.production_amount for production in report_new_entrant.productions.all()}
            if report_new_entrant
            else {}
        )

        return [
            {
                "id": str(product.id),
                "name": product.name,
                "unit": product.unit,
                "production_amount": str(productions_map.get(product.id)) if productions_map.get(product.id) else None,
            }
            for product in regulated_products
        ]

    @staticmethod
    def _get_emissions_data(categories: List[EmissionCategory], report_new_entrant: Optional[ReportNewEntrant]) -> list:
        """Helper to fetch emissions data, categorized by type"""
        emissions_map = (
            {
                emission.emission_category.id: emission.emission
                for emission in report_new_entrant.report_new_entrant_emissions.all()
            }
            if report_new_entrant
            else {}
        )

        emissions_by_type: dict = {
            "basic": [],
            "fuel_excluded": [],
            "other_excluded": [],
        }

        for category in categories:
            category_data = {
                "id": category.id,
                "name": category.category_name,
            }
            # Ensure "emission" is either None or a string
            if category.id in emissions_map:
                category_data["emission"] = str(emissions_map[category.id]) if emissions_map[category.id] else None
            else:
                category_data["emission"] = None
            emissions_by_type[category.category_type].append(category_data)

        return [
            {
                "name": "basic",
                "title": "Emission categories after new entrant period began",
                "emissionData": emissions_by_type["basic"],
            },
            {
                "name": "fuel_excluded",
                "title": "Emissions excluded by fuel type",
                "emissionData": emissions_by_type["fuel_excluded"],
            },
            {
                "name": "other_excluded",
                "title": "Other excluded emissions",
                "emissionData": emissions_by_type["other_excluded"],
            },
        ]

    @classmethod
    @transaction.atomic
    def save_new_entrant_data(
        cls,
        report_version_id: int,
        data: ReportNewEntrantSchemaIn,
    ) -> None:
        """Saves new entrant data and updates the corresponding records."""
        report_version = ReportVersion.objects.get(pk=report_version_id)

        report_new_entrant, _ = ReportNewEntrant.objects.update_or_create(
            report_version=report_version,
            defaults={
                "authorization_date": data.authorization_date,
                "first_shipment_date": data.first_shipment_date,
                "new_entrant_period_start": data.new_entrant_period_start,
                "assertion_statement": data.assertion_statement,
            },
        )

        valid_emission_data = [
            emission_item
            for category in data.emissions
            for emission_item in category["emissionData"]
            if emission_item.get("emission") is not None
        ]

        for emission_item in valid_emission_data:
            ReportNewEntrantEmissions.objects.update_or_create(
                report_new_entrant=report_new_entrant,
                emission_category_id=emission_item["id"],
                defaults={"emission": emission_item["emission"]},
            )

        emission_ids_with_data = [item["id"] for item in valid_emission_data]
        ReportNewEntrantEmissions.objects.filter(report_new_entrant=report_new_entrant).exclude(
            emission_category_id__in=emission_ids_with_data
        ).delete()

        valid_productions = [
            ReportNewEntrantProduction(
                report_new_entrant=report_new_entrant,
                product_id=product["id"],
                production_amount=product["production_amount"],
            )
            for product in data.products
            if product.get("production_amount") is not None
        ]

        valid_product_ids = [prod.product_id for prod in valid_productions]

        ReportNewEntrantProduction.objects.filter(report_new_entrant=report_new_entrant).exclude(
            product_id__in=valid_product_ids
        ).delete()

        ReportNewEntrantProduction.objects.bulk_create(valid_productions, ignore_conflicts=True)
