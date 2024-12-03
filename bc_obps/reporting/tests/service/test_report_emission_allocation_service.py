from decimal import Decimal
from django.test import TestCase
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.service.report_product_service import ReportProductService
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from registration.tests.utils.helpers import TestUtils
from registration.models.regulated_product import RegulatedProduct
from model_bakery.baker import make_recipe

class TestReportEmissionAllocationService(TestCase):
    def setUp(self):
        self.report_version = make_recipe('reporting.tests.utils.report_version')
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
            regulated_products=RegulatedProduct.objects.filter(id__in=[29, 1]),
        )
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=self.report_version)
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid
        self.report_version_id = self.facility_report.report_version.id
        self.facility_uuid = self.facility_report.facility.id
        self.report_product_data = [
            {
                "product_id": 29,
                "annual_production": 100,
                "production_data_apr_dec": 10,
            },
            {
                "product_id": 1,
                "annual_production": 200,
                "production_data_apr_dec": 20,
            },
        ]
        self.mock_get_response = {'report_product_emission_allocations': [{'emission_category': 'flaring', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'fugitive', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'industrial_process', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'onsite', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'stationary', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'venting_useful', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'venting_non_useful', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'waste', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'wastewater', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'woody_biomass', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'excluded_biomass', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}, {'emission_category': 'excluded_non_biomass', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': Decimal('200.0000')}, {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')}], 'emission_total': 0}], 'facility_total_emissions': 0}

    def test_get_report_emission_allocation(self):

        # Arrange: Create products and associate them with the report facility
        # Sort the report product data by product_id to ensure correct order
        sorted_report_product_data = sorted(self.report_product_data, key=lambda x: x["product_id"])

        # Call save_production_data with the sorted report_product_data
        ReportProductService.save_production_data(
            self.report_version_id,
            self.facility_report.facility.id,
            sorted_report_product_data,
            self.test_user_guid,
        )

        # Assert: Report products were created
        report_products = ReportProduct.objects.filter(facility_report=self.facility_report).order_by('product_id')
        assert report_products.count() == 2, "Expected two report products to be created"

        # Arrange: Create product emission allocations for report facility products
        flaring_category = EmissionCategory.objects.get(id=1)
        emission_data = [
            {"category": flaring_category, "quantity": sorted_report_product_data[0]["annual_production"]},
            {"category": flaring_category, "quantity": sorted_report_product_data[1]["annual_production"]},
        ]
        for product, data in zip(report_products, emission_data):
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_version=self.report_version,
                facility_report=self.facility_report,
                report_product=product,
                emission_category=data["category"],
                allocated_quantity=data["quantity"],
            )

        # Assert: Report product emission allocations were created
        report_product_emission_allocations = ReportProductEmissionAllocation.objects.filter(facility_report=self.facility_report)
        assert report_product_emission_allocations.count() == 2, "Expected two product emission allocations to be created"
       
        # Assert: Validate each field of the created product emission allocation records
        expected_data = [
            {
                "report_version_id": self.report_version.id,
                "facility_report_id": self.facility_report.id,
                "report_product_id": report_products[0].id,
                "emission_category_id": flaring_category.id,
                "allocated_quantity": sorted_report_product_data[0]["annual_production"],
            },
            {
                "report_version_id": self.report_version.id,
                "facility_report_id": self.facility_report.id,
                "report_product_id": report_products[1].id,
                "emission_category_id": flaring_category.id,
                "allocated_quantity": sorted_report_product_data[1]["annual_production"],
            },
        ]        

        # Iterate through allocations and expected data for field-wise validation
        for allocation, expected in zip(report_product_emission_allocations.order_by('report_product__product_id'), expected_data):
            self.assertEqual(allocation.report_version_id, expected["report_version_id"], "Mismatched report version ID")
            self.assertEqual(allocation.facility_report_id, expected["facility_report_id"], "Mismatched facility report ID")
            self.assertEqual(allocation.report_product_id, expected["report_product_id"], "Mismatched report product ID")
            self.assertEqual(allocation.emission_category_id, expected["emission_category_id"], "Mismatched emission category ID")
            self.assertEqual(float(allocation.allocated_quantity), float(expected["allocated_quantity"]), 
                            "Mismatched allocated quantity")

    
        # Act: Get the report product emission allocation data from the service           
        retrieved_emission_allocations_data = ReportEmissionAllocationService.get_emission_allocation_data(
            self.report_version_id,
            self.facility_uuid
        )
     
        # Assert: Verify the retrieved instance is not None
        self.assertIsNotNone(retrieved_emission_allocations_data)

        # Assert: Verify the retrieved structure and values match the expected data       
        self.assertIn('report_product_emission_allocations', retrieved_emission_allocations_data)
        self.assertEqual(
            len(retrieved_emission_allocations_data['report_product_emission_allocations']),
            len(self.mock_get_response['report_product_emission_allocations'])
        )
        for expected_category, retrieved_category in zip(
            self.mock_get_response['report_product_emission_allocations'],
            retrieved_emission_allocations_data['report_product_emission_allocations']
        ):
            self.assertEqual(expected_category['emission_category'], retrieved_category['emission_category'])
            self.assertEqual(expected_category['emission_total'], retrieved_category['emission_total'])
            self.assertEqual(len(expected_category['products']), len(retrieved_category['products']))
            
            for expected_product, retrieved_product in zip(expected_category['products'], retrieved_category['products']):
                self.assertEqual(expected_product['product_id'], retrieved_product['product_id'])
                self.assertEqual(expected_product['product_name'], retrieved_product['product_name'])
                self.assertEqual(expected_product['product_emission'], retrieved_product['product_emission'])
