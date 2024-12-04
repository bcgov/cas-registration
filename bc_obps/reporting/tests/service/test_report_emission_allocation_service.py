from decimal import Decimal
from django.test import TestCase
from reporting.models.report_operation import ReportOperation
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from model_bakery.baker import make_recipe, make


class TestReportEmissionAllocationService(TestCase):
    def setUp(self):
        self.test_infrastructure = TestInfrastructure.build()

        operation = make(ReportOperation, report_version=self.test_infrastructure.report_version, make_m2m=True)
        # make_recipe("reporting.tests.utils.report_operation", report_version=self.test_infrastructure.report_version)
        act_st_1 = self.test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )

        report_activity = self.test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make(
            ReportFuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": 101},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": 199.4151},
        )
        print("3")
        # id 1 = Flaring
        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])
        make(
            ReportProduct,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            product_id=1,
        )
        make(
            ReportProduct,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            product_id=29,
        )
        operation.regulated_products.add(1, 29)
        # self.report_product_data = [
        #     {
        #         "product_id": 29,
        #         "annual_production": 100,
        #         "production_data_apr_dec": 10,
        #     },
        #     {
        #         "product_id": 1,
        #         "annual_production": 200,
        #         "production_data_apr_dec": 20,
        #     },
        # ]
        self.mock_get_response = {
            'report_product_emission_allocations': [
                {
                    'emission_category': 'Flaring emissions',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': Decimal('200.0000'),
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': Decimal('100.0000')},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Fugitive emissions',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Industrial process emissions',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'On-site transportation emissions',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Stationary fuel combustion emissions',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Venting emissions — useful',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Venting emissions — non-useful',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Emissions from waste',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'Emissions from wastewater',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'basic',
                },
                {
                    'emission_category': 'CO2 emissions from excluded woody biomass',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'fuel_excluded',
                },
                {
                    'emission_category': 'Other emissions from excluded biomass',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'fuel_excluded',
                },
                {
                    'emission_category': 'Emissions from excluded non-biomass',
                    'products': [
                        {
                            'product_id': 1,
                            'product_name': 'BC-specific refinery complexity throughput',
                            'product_emission': 0,
                        },
                        {'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 0},
                    ],
                    'emission_total': 0,
                    'category_type': 'fuel_excluded',
                },
            ],
            'facility_total_emissions': '300.4151',
            'report_product_emission_allocation_totals': [
                {'product_name': 'BC-specific refinery complexity throughput', 'total_emission': Decimal('200.0000')},
                {'product_name': 'Sugar: solid', 'total_emission': Decimal('100.0000')},
            ],
            'methodology': '',
            'other_methodology_description': '',
        }

    def test_get_report_emission_allocation(self):
        print("4")
        # Arrange: Create products and associate them with the report facility
        # Sort the report product data by product_id to ensure correct order
        ## sorted_report_product_data = sorted(self.report_product_data, key=lambda x: x["product_id"])
        # Call save_production_data with the sorted report_product_data
        # ReportProductService.save_production_data(
        #     self.test_infrastructure.report_version,
        #     self.test_infrastructure.facility_report.facility.id,
        #     sorted_report_product_data,
        #     self.test_infrastructure.user.user_guid,
        # )

        # Assert: Report products were created
        report_products = ReportProduct.objects.filter(
            facility_report=self.test_infrastructure.facility_report
        ).order_by('product_id')
        print("************ Report Products: ", report_products.values())
        assert report_products.count() == 2, "Expected two report products to be created"

        # Arrange: Create product emission allocations for report facility products
        flaring_category = EmissionCategory.objects.get(id=1)
        emission_data = [
            {"category": flaring_category, "quantity": 100},  # sorted_report_product_data[0]["annual_production"]},
            {"category": flaring_category, "quantity": 200},  # sorted_report_product_data[1]["annual_production"]},
        ]
        for product, data in zip(report_products, emission_data):
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_version=self.test_infrastructure.report_version,
                facility_report=self.test_infrastructure.facility_report,
                report_product=product,
                emission_category=data["category"],
                allocated_quantity=data["quantity"],
            )

        # Assert: Report product emission allocations were created
        report_product_emission_allocations = ReportProductEmissionAllocation.objects.filter(
            facility_report=self.test_infrastructure.facility_report
        )
        print("************ Report Product Emission Allocations: ", report_product_emission_allocations.values())
        assert (
            report_product_emission_allocations.count() == 2
        ), "Expected two product emission allocations to be created"

        # Assert: Validate each field of the created product emission allocation records
        expected_data = [
            {
                "report_version_id": self.test_infrastructure.report_version.id,
                "facility_report_id": self.test_infrastructure.facility_report.id,
                "report_product_id": report_products[0].id,
                "emission_category_id": flaring_category.id,
                "allocated_quantity": 100,  # sorted_report_product_data[0]["annual_production"],
            },
            {
                "report_version_id": self.test_infrastructure.report_version.id,
                "facility_report_id": self.test_infrastructure.facility_report.id,
                "report_product_id": report_products[1].id,
                "emission_category_id": flaring_category.id,
                "allocated_quantity": 200,  # sorted_report_product_data[1]["annual_production"],
            },
        ]

        # Iterate through allocations and expected data for field-wise validation
        for allocation, expected in zip(
            report_product_emission_allocations.order_by('report_product__product_id'), expected_data
        ):
            self.assertEqual(
                allocation.report_version_id, expected["report_version_id"], "Mismatched report version ID"
            )
            self.assertEqual(
                allocation.facility_report_id, expected["facility_report_id"], "Mismatched facility report ID"
            )
            self.assertEqual(
                allocation.report_product_id, expected["report_product_id"], "Mismatched report product ID"
            )
            self.assertEqual(
                allocation.emission_category_id, expected["emission_category_id"], "Mismatched emission category ID"
            )
            self.assertEqual(
                float(allocation.allocated_quantity),
                float(expected["allocated_quantity"]),
                "Mismatched allocated quantity",
            )

        # Act: Get the report product emission allocation data from the service
        retrieved_emission_allocations_data = ReportEmissionAllocationService.get_emission_allocation_data(
            self.test_infrastructure.report_version, self.test_infrastructure.facility_report.facility_id
        )
        print("************ Retrieved Emission Allocations: ", retrieved_emission_allocations_data)
        # Assert: Verify the retrieved instance is not None
        self.assertIsNotNone(retrieved_emission_allocations_data)

        # Assert: Verify the retrieved structure and values match the expected data
        self.assertIn('report_product_emission_allocations', retrieved_emission_allocations_data)
        self.assertEqual(
            len(retrieved_emission_allocations_data['report_product_emission_allocations']),
            len(self.mock_get_response['report_product_emission_allocations']),
        )
        for expected_category, retrieved_category in zip(
            self.mock_get_response['report_product_emission_allocations'],
            retrieved_emission_allocations_data['report_product_emission_allocations'],
        ):
            self.assertEqual(expected_category['emission_category'], retrieved_category['emission_category'])
            self.assertEqual(expected_category['emission_total'], retrieved_category['emission_total'])
            self.assertEqual(len(expected_category['products']), len(retrieved_category['products']))

            for expected_product, retrieved_product in zip(
                expected_category['products'], retrieved_category['products']
            ):
                self.assertEqual(expected_product['product_id'], retrieved_product['product_id'])
                self.assertEqual(expected_product['product_name'], retrieved_product['product_name'])
                self.assertEqual(expected_product['product_emission'], retrieved_product['product_emission'])
