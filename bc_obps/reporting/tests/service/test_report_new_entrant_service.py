from datetime import datetime, timezone

import pytest
from model_bakery import baker
from reporting.models import ReportNewEntrant, ReportNewEntrantProduction, ReportNewEntrantEmissions
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn
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
                    "items": [{"name": self.emission_category.category_name, "emission": 100}],
                },
            ],
            products=[
                {
                    "id": 1,
                    "production_amount": 100,
                }
            ],
        )

    def test_get_new_entrant_data(self):

        result = ReportNewEntrantService.get_new_entrant_data(self.report_version_id)

        assert "products" in result
        assert "emissions" in result
        assert "new_entrant_data" in result
        assert len(result["products"]) == 1
        assert result["products"][0]["name"] == self.product.name
        assert result["emissions"][0]["name"] == "basic"
        assert result["emissions"][0]["items"][0]["emission"] == 100

    def test_save_new_entrant_data(self):
        new_data = self.test_data

        new_authorization_date = datetime.strptime(new_data.authorization_date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
            tzinfo=timezone.utc
        )
        new_first_shipment_date = datetime.strptime(new_data.first_shipment_date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
            tzinfo=timezone.utc
        )
        new_new_entrant_period_start = datetime.strptime(
            new_data.new_entrant_period_start, "%Y-%m-%dT%H:%M:%S.%fZ"
        ).replace(tzinfo=timezone.utc)

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
