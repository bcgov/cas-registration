from django.test import TestCase
from model_bakery.baker import make_recipe
from decimal import Decimal

from reporting.models import ReportNewEntrantEmission, ReportNewEntrantProduction
from reporting.service.report_new_entrant_service import ReportNewEntrantService
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn


class TestReportNewEntrantService(TestCase):
    def setUp(self):
        # Arrange: Create mock data
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.report_new_entrant = make_recipe(
            'reporting.tests.utils.report_new_entrant', report_version=self.report_version
        )
        self.regulated_product = make_recipe('registration.tests.utils.regulated_product')
        self.emission_category = make_recipe('reporting.tests.utils.emission_category')

        self.report_new_entrant_emission = make_recipe(
            'reporting.tests.utils.report_new_entrant_emission',
            report_new_entrant=self.report_new_entrant,
            emission_category=self.emission_category,
            emission=Decimal('15.0'),
        )
        self.report_new_entrant_production = make_recipe(
            'reporting.tests.utils.report_new_entrant_production',
            report_new_entrant=self.report_new_entrant,
            product=self.regulated_product,
            production_amount=Decimal('100.0'),
        )

        self.report_operation = make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=self.report_version,
            regulated_products=[self.regulated_product],
        )

    def test_get_new_entrant_data(self):
        """
        Test that the service retrieves the correct ReportNewEntrant instance
        for a given report version ID.
        """
        result = ReportNewEntrantService.get_new_entrant_data(self.report_version.id)

        self.assertEqual(result, self.report_new_entrant)
        self.assertEqual(result.report_version, self.report_version)

    def test_get_products_data(self):
        """
        Test that the service retrieves regulated products with associated production amounts.
        """
        result = ReportNewEntrantService.get_products_data(self.report_version.id)
        production = result.first()
        self.assertIsNotNone(production)
        self.assertEqual(production.production_amount, self.report_new_entrant_production.production_amount)

    def test_get_emissions_data(self):
        """
        Test that the service retrieves emissions data categorized by emission type.
        """
        result = ReportNewEntrantService.get_emissions_data(self.report_version.id)

        self.assertIsNotNone(result)
        self.assertTrue(result.count() > 0)  # Ensure at least one emission category is returned

        # Check that the emission value matches the created data
        emission_data = result.filter(id=self.emission_category.id).first()
        self.assertIsNotNone(emission_data)
        self.assertEqual(emission_data.emission, self.report_new_entrant_emission.emission)

    def test_save_new_entrant_data(self):
        """
        Test that the service saves or updates the new entrant data correctly.
        """
        data = ReportNewEntrantSchemaIn(
            authorization_date='2024-01-01',
            first_shipment_date='2024-02-01',
            new_entrant_period_start='2024-03-01',
            assertion_statement=True,
            emissions=[
                {
                    "title": "Emission categories after new entrant period began",
                    "emissionData": [
                        {"id": self.emission_category.id, "name": "Flaring emissions", "emission": 50.0},
                        {"id": 2, "name": "Fugitive emissions", "emission": 10.0},
                    ],
                },
                {
                    "title": "Emissions excluded by fuel type",
                    "emissionData": [
                        {"id": 10, "name": "CO2 emissions from excluded woody biomass", "emission": 5.0},
                    ],
                },
            ],
            products=[
                {"id": self.regulated_product.id, "production_amount": Decimal('200.0')},
            ],
        )

        result = ReportNewEntrantService.save_new_entrant_data(self.report_version.id, data)

        self.assertIsNotNone(result)
        self.assertEqual(result.authorization_date, data.authorization_date)
        self.assertEqual(result.first_shipment_date, data.first_shipment_date)
        self.assertEqual(result.new_entrant_period_start, data.new_entrant_period_start)
        self.assertTrue(result.assertion_statement)

        # Assert emissions are created
        self.assertTrue(
            ReportNewEntrantEmission.objects.filter(
                report_new_entrant=result,
                emission_category=self.emission_category,
                emission=50.0,
            ).exists()
        )

        self.assertTrue(
            ReportNewEntrantEmission.objects.filter(
                report_new_entrant=result,
                emission_category_id=2,
                emission=10.0,
            ).exists()
        )

        self.assertTrue(
            ReportNewEntrantEmission.objects.filter(
                report_new_entrant=result,
                emission_category_id=10,
                emission=5.0,
            ).exists()
        )

        # Assert products are created
        self.assertTrue(
            ReportNewEntrantProduction.objects.filter(
                report_new_entrant=result,
                product=self.regulated_product,
                production_amount=Decimal('200.0'),
            ).exists()
        )

    def test_save_new_entrant_data_with_empty_data_deletes_old_records(self):
        """
        Test that when empty data is submitted, old records (emissions, products) are deleted.
        """
        # Submit empty data for emissions and products
        data = ReportNewEntrantSchemaIn(
            authorization_date='2024-01-01',
            first_shipment_date='2024-02-01',
            new_entrant_period_start='2024-03-01',
            assertion_statement=True,
            emissions=[],
            products=[],
        )

        # Save the data, which should delete old records
        result = ReportNewEntrantService.save_new_entrant_data(self.report_version.id, data)

        # Fetch the related emissions and products
        emissions = ReportNewEntrantEmission.objects.filter(report_new_entrant=result)
        products = ReportNewEntrantProduction.objects.filter(report_new_entrant=result)

        # Ensure that old records were deleted
        self.assertEqual(emissions.count(), 0)
        self.assertEqual(products.count(), 0)
