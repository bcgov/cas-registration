from decimal import Decimal
from django.test import TestCase
from reporting.models.emission_category import EmissionCategory
from reporting.schema.report_product_emission_allocation import ReportProductEmissionAllocationsSchemaIn
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from reporting.models.report_product import ReportProduct
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from model_bakery.baker import make


class TestReportEmissionAllocationService(TestCase):
    FLARING_CATEGORY_ID = 1
    WOODY_BIOMASS_CATEGORY_ID = 10
    ALLOCATION_AMOUNT_1 = Decimal("100.9999")
    ALLOCATION_AMOUNT_2 = Decimal("200.0000")
    ALLOCATION_AMOUNT_3 = Decimal("100.0000")

    ALLOCATING_AMOUNT_1 = Decimal("25.0000")
    ALLOCATING_AMOUNT_2 = Decimal("75.0000")
    ALLOCATING_AMOUNT_3 = Decimal("100.0000")

    def create_mock_allocation_array(
        self, report_product1: ReportProduct, report_product2: ReportProduct, test_stage: int
    ):
        result_array = []
        emission_categories = EmissionCategory.objects.all().exclude(category_type="other_excluded")
        for category in emission_categories:
            mock_allocation = {
                "emission_category_name": category.category_name,
                "emission_category_id": category.id,
                "products": [
                    {
                        "report_product_id": report_product1.id,
                        "product_name": report_product1.product.name,
                        "allocated_quantity": 0,
                    },
                    {
                        "report_product_id": report_product2.id,
                        "product_name": report_product2.product.name,
                        "allocated_quantity": 0,
                    },
                ],
                "emission_total": 0,
                "category_type": category.category_type,
            }
            match test_stage:
                case 1:  # specifics for get test
                    if category.id == self.FLARING_CATEGORY_ID:
                        mock_allocation["products"][0]["allocated_quantity"] = self.ALLOCATION_AMOUNT_1
                        mock_allocation["products"][1]["allocated_quantity"] = self.ALLOCATION_AMOUNT_2
                        mock_allocation["emission_total"] = self.ALLOCATION_AMOUNT_1 + self.ALLOCATION_AMOUNT_2
                    if category.id == self.WOODY_BIOMASS_CATEGORY_ID:
                        mock_allocation["products"][1]["allocated_quantity"] = self.ALLOCATION_AMOUNT_3
                        mock_allocation["emission_total"] = self.ALLOCATION_AMOUNT_3
                case 2:  # specifics for save test 1st part
                    if category.id == self.FLARING_CATEGORY_ID:
                        mock_allocation["products"][0]["allocated_quantity"] = self.ALLOCATING_AMOUNT_1
                        mock_allocation["products"][1]["allocated_quantity"] = self.ALLOCATING_AMOUNT_2
                case 3:  # specifics for save test 2nd part
                    if category.id == self.FLARING_CATEGORY_ID:
                        mock_allocation["products"][1]["allocated_quantity"] = self.ALLOCATING_AMOUNT_3
            result_array.append(mock_allocation)
        return result_array

    def setUp(self):
        # Arrange: sets up the report elements necessary to allocate emissions
        self.test_infrastructure = TestInfrastructure.build()

        activity_source_type = self.test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",
            has_unit=True,
            has_fuel=True,
        )

        report_activity = self.test_infrastructure.make_report_activity()
        report_source_type = make(
            ReportSourceType,
            activity_source_type_base_schema=activity_source_type,
            source_type=activity_source_type.source_type,
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
        report_fuel_excluded = make(
            ReportFuel,
            fuel_type_id=64,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_unit": True},
            report_unit=None,
        )

        report_emission_1 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": 25.9998},
        )

        report_emission_2 = make(
            ReportEmission,
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": 275.0001},
        )
        report_emission_excluded = make(
            ReportEmission,
            report_fuel=report_fuel_excluded,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            json_data={"equivalentEmission": 100.0000},
        )

        report_emission_1.emission_categories.set([self.FLARING_CATEGORY_ID])
        report_emission_2.emission_categories.set([self.FLARING_CATEGORY_ID])
        report_emission_excluded.emission_categories.set([self.WOODY_BIOMASS_CATEGORY_ID])

        report_product_1 = make(
            ReportProduct,
            id=3,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            product_id=1,  #  "BC-specific refinery complexity throughput"
        )
        report_product_2 = make(
            ReportProduct,
            id=4,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            product_id=29,  # "Sugar: solid"
        )

        self.mock_get_response = {
            "report_product_emission_allocations": self.create_mock_allocation_array(
                report_product1=report_product_1, report_product2=report_product_2, test_stage=1
            ),
            "facility_total_emissions": self.ALLOCATION_AMOUNT_1 + self.ALLOCATION_AMOUNT_2,
            "report_product_emission_allocation_totals": [
                {
                    "report_product_id": report_product_1.id,
                    "product_name": report_product_1.product.name,
                    "allocated_quantity": self.ALLOCATION_AMOUNT_1,
                },
                {
                    "report_product_id": report_product_2.id,
                    "product_name": report_product_2.product.name,
                    "allocated_quantity": self.ALLOCATION_AMOUNT_2,
                },
            ],
            "allocation_methodology": "other",
            "allocation_other_methodology_description": "test",
        }

        self.post_payload = ReportProductEmissionAllocationsSchemaIn(
            report_product_emission_allocations=self.create_mock_allocation_array(
                report_product1=report_product_1, report_product2=report_product_2, test_stage=2
            ),
            allocation_methodology="other",
            allocation_other_methodology_description="test",
        )

        self.post_payload2 = ReportProductEmissionAllocationsSchemaIn(
            report_product_emission_allocations=self.create_mock_allocation_array(
                report_product1=report_product_1, report_product2=report_product_2, test_stage=3
            ),
            allocation_methodology="other",
            allocation_other_methodology_description="test",
        )

    def test_get_report_emission_allocation(self):

        # Arrange: Create product emission allocations for report facility products
        report_products = ReportProduct.objects.filter(
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
        )
        emission_data = [
            {"category": self.FLARING_CATEGORY_ID, "quantity": self.ALLOCATION_AMOUNT_1},
            {"category": self.FLARING_CATEGORY_ID, "quantity": self.ALLOCATION_AMOUNT_2},
        ]

        for product, data in zip(report_products, emission_data):
            make(
                ReportProductEmissionAllocation,
                report_version=self.test_infrastructure.report_version,
                facility_report=self.test_infrastructure.facility_report,
                report_product=product,
                emission_category_id=data["category"],
                allocated_quantity=data["quantity"],
                allocation_methodology="other",
                allocation_other_methodology_description="test",
            )
        # Arrange: Create an emission allocation to an excluded category
        make(
            ReportProductEmissionAllocation,
            report_version=self.test_infrastructure.report_version,
            facility_report=self.test_infrastructure.facility_report,
            report_product=report_products[1],
            emission_category_id=self.WOODY_BIOMASS_CATEGORY_ID,
            allocated_quantity=self.ALLOCATION_AMOUNT_3,
            allocation_methodology="other",
            allocation_other_methodology_description="test",
        )

        # Assert: Report product emission allocations were created
        report_product_emission_allocations = ReportProductEmissionAllocation.objects.filter(
            facility_report=self.test_infrastructure.facility_report
        )

        assert (
            report_product_emission_allocations.count() == 3
        ), "Expected three product emission allocations to be created"

        # Assert: Validate each field of the created product emission allocation records
        expected_data = [
            {
                "report_version_id": self.test_infrastructure.report_version.id,
                "facility_report_id": self.test_infrastructure.facility_report.id,
                "report_product_id": report_products[0].id,
                "emission_category_id": self.FLARING_CATEGORY_ID,
                "allocated_quantity": self.ALLOCATION_AMOUNT_1,  # sorted_report_product_data[0]["annual_production"],
            },
            {
                "report_version_id": self.test_infrastructure.report_version.id,
                "facility_report_id": self.test_infrastructure.facility_report.id,
                "report_product_id": report_products[1].id,
                "emission_category_id": self.FLARING_CATEGORY_ID,
                "allocated_quantity": self.ALLOCATION_AMOUNT_2,  # sorted_report_product_data[1]["annual_production"],
            },
            {
                "report_version_id": self.test_infrastructure.report_version.id,
                "facility_report_id": self.test_infrastructure.facility_report.id,
                "report_product_id": report_products[1].id,
                "emission_category_id": self.WOODY_BIOMASS_CATEGORY_ID,
                "allocated_quantity": self.ALLOCATION_AMOUNT_3,
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

        # Assert: Verify the retrieved instance is not None
        self.assertIsNotNone(retrieved_emission_allocations_data)

        retrieved_emission_allocations_dict = retrieved_emission_allocations_data.dict()

        # Assert: Verify the retrieved structure and values match the expected data
        self.assertIn(
            'report_product_emission_allocations',
            retrieved_emission_allocations_dict,
            "report_product_emission_allocations key is missing",
        )
        self.assertIn(
            'facility_total_emissions', retrieved_emission_allocations_dict, "facility_total_emissions key is missing"
        )
        self.assertIn(
            'report_product_emission_allocation_totals',
            retrieved_emission_allocations_dict,
            "report_product_emission_allocation_totals key is missing",
        )
        self.assertIn(
            'allocation_methodology', retrieved_emission_allocations_dict, "allocation_methodology key is missing"
        )
        self.assertIn(
            'allocation_other_methodology_description',
            retrieved_emission_allocations_dict,
            "allocation_other_methodology_description key is missing",
        )

        # Assert: Verify that the expected values match the retrieved values
        self.assertEqual(
            self.mock_get_response['allocation_methodology'],
            retrieved_emission_allocations_dict['allocation_methodology'],
        )
        self.assertEqual(
            self.mock_get_response['allocation_other_methodology_description'],
            retrieved_emission_allocations_dict['allocation_other_methodology_description'],
        )
        self.assertEqual(
            retrieved_emission_allocations_dict['facility_total_emissions'],
            self.mock_get_response['facility_total_emissions'],
        )
        for expected_category, retrieved_category in zip(
            self.mock_get_response['report_product_emission_allocations'],
            retrieved_emission_allocations_dict['report_product_emission_allocations'],
        ):
            self.assertEqual(expected_category['emission_category_name'], retrieved_category['emission_category_name'])
            self.assertEqual(expected_category['emission_category_id'], retrieved_category['emission_category_id'])
            self.assertEqual(expected_category['emission_total'], retrieved_category['emission_total'])
            self.assertEqual(len(expected_category['products']), len(retrieved_category['products']))

            for expected_product, retrieved_product in zip(
                expected_category['products'], retrieved_category['products']
            ):
                self.assertEqual(expected_product['report_product_id'], retrieved_product['report_product_id'])
                self.assertEqual(expected_product['product_name'], retrieved_product['product_name'])
                self.assertEqual(expected_product['allocated_quantity'], retrieved_product['allocated_quantity'])

        # Assert: verify that the allocated totals do NOT include amounts allocated to excluded categories
        for expected_product_total, retrieved_product_total in zip(
            self.mock_get_response['report_product_emission_allocation_totals'],
            retrieved_emission_allocations_dict['report_product_emission_allocation_totals'],
        ):
            self.assertEqual(expected_product_total['report_product_id'], retrieved_product_total['report_product_id'])
            self.assertEqual(expected_product_total['product_name'], retrieved_product_total['product_name'])
            self.assertEqual(
                expected_product_total['allocated_quantity'], retrieved_product_total['allocated_quantity']
            )

    def test_save_emission_allocation(self):

        # Act:  Use the service to save some emission allocation data (payload includes data for 2 allocations)
        ReportEmissionAllocationService.save_emission_allocation_data(
            self.test_infrastructure.report_version.pk,
            self.test_infrastructure.facility_report.facility_id,
            self.post_payload,
            self.test_infrastructure.user.user_guid,
        )
        # Assert: Verify that 2 allocations have been saved
        self.assertEqual(ReportProductEmissionAllocation.objects.count(), 2, "Expected two allocations to be saved")

        # Assert: Verify that the saved allocations match the expected data
        allocation1 = ReportProductEmissionAllocation.objects.filter(
            report_product_id=3, emission_category_id=self.FLARING_CATEGORY_ID
        ).first()
        self.assertIsNotNone(allocation1)
        self.assertEqual(
            allocation1.allocated_quantity, self.ALLOCATING_AMOUNT_1, "Expected allocated amount to match payload"
        )
        allocation2 = ReportProductEmissionAllocation.objects.filter(
            report_product_id=4, emission_category_id=self.FLARING_CATEGORY_ID
        ).first()
        self.assertIsNotNone(allocation2)
        self.assertEqual(
            allocation2.allocated_quantity, self.ALLOCATING_AMOUNT_2, "Expected allocated amount to match payload"
        )

        # Act: Use the service to do a new save of emission allocation data
        # The payload used for this save moves all of the allocated emissions from one product to the other
        ReportEmissionAllocationService.save_emission_allocation_data(
            self.test_infrastructure.report_version.pk,
            self.test_infrastructure.facility_report.facility_id,
            self.post_payload2,
            self.test_infrastructure.user.user_guid,
        )

        self.assertEqual(ReportProductEmissionAllocation.objects.count(), 1, "Expected only one allocation to be saved")
        allocation1 = ReportProductEmissionAllocation.objects.filter(
            report_product_id=3, emission_category_id=self.FLARING_CATEGORY_ID
        ).first()
        self.assertIsNone(allocation1, "Expected this allocation to be deleted")
        # Assert: Verify that the second allocation has been updated
        allocation2 = ReportProductEmissionAllocation.objects.filter(
            report_product_id=4, emission_category_id=self.FLARING_CATEGORY_ID
        ).first()
        self.assertIsNotNone(allocation2)
        self.assertEqual(
            allocation2.allocated_quantity, self.ALLOCATING_AMOUNT_3, "Expected this allocation to be updated"
        )
