from datetime import datetime
from unittest.mock import patch

import pytest
from model_bakery import baker
from reporting.models import (
    ReportNewEntrant,
    ReportNewEntrantProduction,
    ReportNewEntrantEmissions,
)
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn
from reporting.schema.report_regulated_products import RegulatedProductOut
from reporting.service.report_new_entrant_service import ReportNewEntrantService

pytestmark = pytest.mark.django_db


class TestReportNewEntrantService:
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_new_entrant = baker.make_recipe(
            "reporting.tests.utils.report_new_entrant", report_version=self.report_version
        )
        self.emission_category = baker.make_recipe("reporting.tests.utils.emission_category")
        self.product = baker.make_recipe("reporting.tests.utils.regulated_product")
        self.report_version_id = self.report_version.id

        self.test_data = ReportNewEntrantSchemaIn(
            authorization_date="2024-12-01T16:15:00.070Z",
            first_shipment_date="2024-12-01T16:15:00.070Z",
            new_entrant_period_start="2024-12-01T16:15:00.070Z",
            assertion_statement=True,
            emissions=[
                {
                    "name": "basic",
                    "title": "Emission categories after new entrant period began",
                    "emissionData": [
                        {"id": self.emission_category.id, "name": self.emission_category.category_name, "emission": 100}
                    ],
                },
            ],
            products=[
                {
                    "id": self.product.id,
                    "production_amount": 100,
                }
            ],
        )

    def test_get_new_entrant_data(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_version_id = self.report_version.id  # Use the ID of the created ReportVersion

        mocked_products = [
            RegulatedProductOut(id=1, name="Product 1", unit="kg"),
        ]

        with patch(
            'service.report_service.ReportService.get_regulated_products_by_version_id', return_value=mocked_products
        ):

            report_new_entrant = ReportNewEntrant.objects.create(
                report_version_id=self.report_version_id,
                authorization_date="2024-01-01",
                first_shipment_date="2024-02-01",
                new_entrant_period_start="2024-03-01",
                assertion_statement=True,
            )

            category1 = baker.make_recipe(
                "reporting.tests.utils.emission_category", category_name="Category 1", category_type="basic"
            )

            report_new_entrant.report_new_entrant_emissions.create(emission_category=category1, emission=100)

            result = ReportNewEntrantService.get_new_entrant_data(self.report_version_id)

            assert "products" in result
            assert "emissions" in result
            assert "new_entrant_data" in result
            assert len(result["products"]) == 1
            assert result["products"][0]["name"] == "Product 1"  # Check product name
            assert result["emissions"][0]["name"] == "basic"  # Check emission category name

    def test_save_new_entrant_data(self):
        new_data = self.test_data

        new_authorization_date = datetime.fromisoformat(new_data.authorization_date.replace("Z", "+00:00"))
        new_first_shipment_date = datetime.fromisoformat(new_data.first_shipment_date.replace("Z", "+00:00"))
        new_new_entrant_period_start = datetime.fromisoformat(new_data.new_entrant_period_start.replace("Z", "+00:00"))

        ReportNewEntrantService.save_new_entrant_data(self.report_version_id, new_data)

        report_new_entrant = ReportNewEntrant.objects.get(report_version=self.report_version)

        assert report_new_entrant.authorization_date == new_authorization_date
        assert report_new_entrant.first_shipment_date == new_first_shipment_date
        assert report_new_entrant.new_entrant_period_start == new_new_entrant_period_start
        assert report_new_entrant.assertion_statement == new_data.assertion_statement

        emission = ReportNewEntrantEmissions.objects.get(report_new_entrant=report_new_entrant)
        assert emission.emission == 100
        assert emission.emission_category.category_name == self.emission_category.category_name

        production = ReportNewEntrantProduction.objects.get(report_new_entrant=report_new_entrant)
        assert production.production_amount == 100
