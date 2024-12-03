from typing import List, Dict, Optional, Any
from django.db import transaction
from django.forms import model_to_dict

from registration.models import RegulatedProduct
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
        # Fetch the ReportNewEntrant object
        report_new_entrant = ReportNewEntrant.objects.get(report_version=report_version_id)

        # Fetch regulated products using ReportService
        regulated_products = ReportService.get_regulated_products_by_version_id(version_id=report_version_id)

        # Fetch emission categories
        categories = list(EmissionCategory.objects.all())

        # Initialize and return result data
        return cls._initialize_result_data(regulated_products, categories, report_new_entrant)

    @staticmethod
    def _initialize_result_data(
        regulated_products: List[RegulatedProductOut],
        categories: List[EmissionCategory],
        report_new_entrant: ReportNewEntrant,
    ) -> Dict[str, Any]:
        """Helper to initialize the result data"""
        products_data = ReportNewEntrantService._get_products_data(regulated_products, report_new_entrant)
        emissions_data = ReportNewEntrantService._get_emissions_data(categories, report_new_entrant)
        result_data = model_to_dict(report_new_entrant, exclude=['selected_products'])
        return {"products": products_data, "emissions": emissions_data, "new_entrant_data": result_data}

    @staticmethod
    def _get_products_data(
        regulated_products: List[RegulatedProductOut], report_new_entrant: ReportNewEntrant
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
    def _get_emissions_data(
        categories: List[EmissionCategory], report_new_entrant: ReportNewEntrant
    ) -> List[Dict[str, Optional[str]]]:
        """Helper to fetch emissions data, categorized by type"""
        emissions_map = (
            {
                emission.emission_category.id: emission.emission
                for emission in report_new_entrant.report_new_entrant_emissions.all()
            }
            if report_new_entrant
            else {}
        )

        emissions_by_type: Dict[str, List[Dict[str, Optional[str]]]] = {
            "basic": [],
            "fuel_excluded": [],
            "other_excluded": [],
        }

        for category in categories:
            category_data = {
                "id": str(category.id),
                "name": category.category_name,
                "emission": emissions_map.get(category.id),
            }
            emissions_by_type[category.category_type].append(category_data)

        return [
            {
                "name": "basic",
                "title": "Emission categories after new entrant period began",
                "items": emissions_by_type["basic"],
            },
            {
                "name": "fuel_excluded",
                "title": "Emissions excluded by fuel type",
                "items": emissions_by_type["fuel_excluded"],
            },
            {
                "name": "other_excluded",
                "title": "Other excluded emissions",
                "items": emissions_by_type["other_excluded"],
            },
        ]

    @classmethod
    @transaction.atomic
    def save_new_entrant_data(
        cls,
        report_version_id: int,
        data: ReportNewEntrantSchemaIn,
    ) -> None:
        """Saves new entrant data and updates the corresponding records"""
        report_version = ReportVersion.objects.get(pk=report_version_id)

        entrant_data = {
            "authorization_date": data.authorization_date,
            "first_shipment_date": data.first_shipment_date,
            "new_entrant_period_start": data.new_entrant_period_start,
            "assertion_statement": data.assertion_statement,
        }

        report_new_entrant, _ = ReportNewEntrant.objects.update_or_create(
            report_version=report_version,
            defaults=entrant_data,
        )

        for category in data.emissions:
            for emission_item in category["items"]:
                emission_category = EmissionCategory.objects.get(category_name=emission_item["name"])

                ReportNewEntrantEmissions.objects.update_or_create(
                    report_new_entrant=report_new_entrant,
                    emission_category=emission_category,
                    defaults={"emission": emission_item["emission"]},
                )

        production_data = [
            {"product_id": product["id"], "production_amount": product["production_amount"]}
            for product in data.products
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
