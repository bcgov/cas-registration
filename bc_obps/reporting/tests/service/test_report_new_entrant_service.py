from django.test import TestCase
from model_bakery.baker import make_recipe
from unittest.mock import patch
from reporting.service.report_new_entrant_service import ReportNewEntrantService
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn, ReportNewEntrantProductionSchema
from decimal import Decimal


class TestReportNewEntrantService(TestCase):
    def setUp(self):
        # Arrange: Create mock data
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        self.report_new_entrant = make_recipe('reporting.tests.utils.report_new_entrant',
                                              report_version=self.report_version)
        self.regulated_product = make_recipe('registration.tests.utils.regulated_product')
        self.report_operation = make_recipe('reporting.tests.utils.report_operation',
                                            report_version=self.report_version)
        self.emission_category = make_recipe('reporting.tests.utils.emission_category')
        self.report_new_entrant_emissions = make_recipe('reporting.tests.utils.report_new_entrant_emissions',
                                                        report_new_entrant=self.report_new_entrant)
        self.report_new_entrant_production = make_recipe('reporting.tests.utils.report_new_entrant_production',
                                                         report_new_entrant=self.report_new_entrant)

    def test_get_new_entrant_data(self):
        """
        Test that the service retrieves the correct ReportNewEntrant instance
        for a given report version ID.
        """
        # Act: Call the service to get the new entrant data
        result = ReportNewEntrantService.get_new_entrant_data(self.report_version.id)

        self.assertEqual(result, self.report_new_entrant)
        self.assertEqual(result.report_version, self.report_version)

    def test_get_products_data(self):
        """
        Test that the service retrieves regulated products with associated production amounts.
        """
        result = list(ReportNewEntrantService.get_products_data(self.report_version.id))
        print('result', result)

        self.assertCountEqual(result, [self.report_new_entrant_production])

    def test_get_emissions_data(self):
        """
        Test that the service retrieves emissions data categorized by emission type.
        """
        result = ReportNewEntrantService.get_emissions_data(self.report_version.id)

        self.assertEqual(result, self.report_new_entrant_emissions)

    @patch('reporting.service.report_new_entrant_service.ReportNewEntrant.objects.update_or_create')
    @patch('reporting.service.report_new_entrant_service.ReportNewEntrantEmissions.objects.bulk_create')
    @patch('reporting.service.report_new_entrant_service.ReportNewEntrantProduction.objects.bulk_create')
    def test_save_new_entrant_data(self, mock_bulk_create_production, mock_bulk_create_emissions,
                                   mock_update_or_create):
        """
        Test that the service saves or updates the new entrant data correctly.
        """
        data = ReportNewEntrantSchemaIn(
            authorization_date='2024-01-01',
            first_shipment_date='2024-02-01',
            new_entrant_period_start='2024-03-01',
            assertion_statement=True,
            emissions=[{'id': self.emission_category.id, 'emissionData': [{'id': 1, 'emission': 50}]}],
            products=[{'id': self.regulated_product.id, 'production_amount': Decimal('200.0')}],
        )

        mock_update_or_create.return_value = (self.report_new_entrant, True)
        mock_bulk_create_emissions.return_value = None
        mock_bulk_create_production.return_value = None

        ReportNewEntrantService.save_new_entrant_data(self.report_version.id, data)

        mock_update_or_create.assert_called_once_with(
            report_version=self.report_version,
            defaults={
                "authorization_date": data.authorization_date,
                "first_shipment_date": data.first_shipment_date,
                "new_entrant_period_start": data.new_entrant_period_start,
                "assertion_statement": data.assertion_statement,
            }
        )
        mock_bulk_create_emissions.assert_called_once()
        mock_bulk_create_production.assert_called_once()
