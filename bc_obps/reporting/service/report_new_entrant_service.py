from django.db import transaction
from django.db.models import Subquery, OuterRef, DecimalField, QuerySet
from registration.models import RegulatedProduct
from reporting.models import (
    ReportNewEntrant,
    ReportNewEntrantProduction,
    EmissionCategory,
    ReportNewEntrantEmission,
    ReportOperation,
)
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn


class ReportNewEntrantService:
    @classmethod
    def get_new_entrant_data(cls, report_version_id: int) -> ReportNewEntrant | None:
        """
        Returns the ReportNewEntrant instance associated with the given report_version_id.
        """
        return ReportNewEntrant.objects.filter(report_version=report_version_id).first()

    @staticmethod
    def get_products_data(report_version_id: int) -> QuerySet[RegulatedProduct]:
        """
        Retrieve regulated product details and associated production amounts for each product declared in the operation
        data form of a report version.
        """
        return RegulatedProduct.objects.filter(
            id__in=ReportOperation.objects.filter(report_version_id=report_version_id).values_list(
                'regulated_products__id', flat=True
            )
        ).annotate(
            production_amount=Subquery(
                ReportNewEntrantProduction.objects.filter(
                    product=OuterRef('pk'), report_new_entrant__report_version_id=report_version_id
                ).values('production_amount')[:1],
                output_field=DecimalField(),
            )
        )

    @staticmethod
    def get_emissions_data(report_version_id: int) -> QuerySet[EmissionCategory]:
        """
        For each emission category, annotate the reported emission amount for a new entrant. If no emission was reported
        ,the emission category is still returned.
        """
        return EmissionCategory.objects.annotate(
            emission=Subquery(
                ReportNewEntrantEmission.objects.filter(
                    emission_category=OuterRef('pk'), report_new_entrant__report_version_id=report_version_id
                ).values('emission')[:1],
                output_field=DecimalField(),
            )
        )

    @classmethod
    @transaction.atomic
    def save_new_entrant_data(
        cls,
        report_version_id: int,
        data: ReportNewEntrantSchemaIn,
    ) -> ReportNewEntrant:
        """
        Saves new entrant data by replacing all associated records.

        Args:
            report_version_id: ID of the ReportVersion instance.
            data: Input data for new entrant creation or update.
        """
        report_new_entrant, _ = ReportNewEntrant.objects.update_or_create(
            report_version_id=report_version_id,  # Pass the ID directly
            defaults={
                "authorization_date": data.authorization_date,
                "first_shipment_date": data.first_shipment_date,
                "new_entrant_period_start": data.new_entrant_period_start,
                "assertion_statement": data.assertion_statement,
            },
        )

        ReportNewEntrantEmission.objects.filter(report_new_entrant=report_new_entrant).delete()
        ReportNewEntrantProduction.objects.filter(report_new_entrant=report_new_entrant).delete()

        emissions_to_create = [
            ReportNewEntrantEmission(
                report_new_entrant=report_new_entrant,
                emission_category_id=emission_item["id"],
                emission=emission_item["emission"],
            )
            for category in data.emissions
            for emission_item in category["emissionData"]
            if emission_item.get("emission") is not None
        ]
        ReportNewEntrantEmission.objects.bulk_create(emissions_to_create)

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

        return report_new_entrant
