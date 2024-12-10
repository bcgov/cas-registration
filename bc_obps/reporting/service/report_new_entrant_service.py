from typing import List
from django.db import transaction
from django.db.models import Subquery, OuterRef, DecimalField

from registration.models import RegulatedProduct
from reporting.models import (
    ReportVersion,
    ReportNewEntrant,
    ReportNewEntrantProduction,
    EmissionCategory,
    ReportNewEntrantEmissions,
    ReportOperation,
)
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn, ReportNewEntrantProductionSchema


class ReportNewEntrantService:
    @classmethod
    def get_new_entrant_data(cls, report_version_id: int) -> ReportNewEntrant:
        """Returns a dictionary containing products, emissions, and new entrant data."""
        return ReportNewEntrant.objects.filter(report_version=report_version_id).first()

    @staticmethod
    def get_products_data(version_id) -> List[ReportNewEntrantProductionSchema]:
        """Retrieve regulated products and associated production amounts for the given version_id."""
        return RegulatedProduct.objects.filter(
            id__in=ReportOperation.objects.filter(report_version_id=version_id)
            .values_list('regulated_products__id', flat=True)
        ).annotate(
            production_amount=Subquery(
                ReportNewEntrantProduction.objects.filter(
                    product=OuterRef('pk'),  # Referring to RegulatedProduct's pk
                    report_new_entrant__report_version_id=version_id  # Filter by version_id
                ).values('production_amount')[:1],  # Ensure we get only one production_amount
                output_field=DecimalField(),
            )
        )

    @staticmethod
    def get_emissions_data(report_version_id) -> dict:
        """Helper to fetch emissions data, categorized by type"""
        return EmissionCategory.objects.annotate(
            emission=Subquery(
                ReportNewEntrantEmissions.objects.filter(
                    emission_category=OuterRef('pk'),
                    report_new_entrant__report_version_id=report_version_id
                ).values('emission'),
                output_field=DecimalField(),
            )
        )

    @classmethod
    @transaction.atomic
    def save_new_entrant_data(
        cls,
        report_version_id: int,
        data: ReportNewEntrantSchemaIn,
    ) -> None:
        """Saves new entrant data by replacing all associated records."""
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

        ReportNewEntrantEmissions.objects.filter(report_new_entrant=report_new_entrant).delete()
        ReportNewEntrantProduction.objects.filter(report_new_entrant=report_new_entrant).delete()

        emissions_to_create = [
            ReportNewEntrantEmissions(
                report_new_entrant=report_new_entrant,
                emission_category_id=emission_item["id"],
                emission=emission_item["emission"],
            )
            for category in data.emissions
            for emission_item in category["emissionData"]
            if emission_item.get("emission") is not None
        ]
        ReportNewEntrantEmissions.objects.bulk_create(emissions_to_create)

        productions_to_create = [
            ReportNewEntrantProduction(
                report_new_entrant=report_new_entrant,
                product_id=product["id"],
                production_amount=product["production_amount"],
            )
            for product in data.products
            if product.get("production_amount") is not None
        ]
        ReportNewEntrantProduction.objects.bulk_create(productions_to_create)
