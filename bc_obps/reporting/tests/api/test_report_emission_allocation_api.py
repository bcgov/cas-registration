
from model_bakery.baker import make_recipe
from unittest.mock import  patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from registration.models.regulated_product import RegulatedProduct
from reporting.models.report_product import ReportProduct
from reporting.service.report_product_service import ReportProductService
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.models.emission_category import EmissionCategory
from reporting.schema.report_product_emission_allocation import ReportProductEmissionAllocationSchemaIn


class TestReportEmissionAllocationApi(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe('reporting.tests.utils.report_version')
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            regulated_products=RegulatedProduct.objects.filter(id__in=[29, 1]),
        )
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid
        self.report_version_id = self.facility_report.report_version.id
        self.facility_id = self.facility_report.facility.id        
        self.report_product_data = [
            {
                "product_id": 29,
                "annual_production": 1234,
                "production_data_apr_dec": 123,
            },
            {
                "product_id": 1,
                "annual_production": 200,
                "production_data_apr_dec": 20,
            },
        ]
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
      
    @patch(
        "reporting.service.report_emission_allocation_service.ReportEmissionAllocationService.get_emission_allocation_data", 
        autospec=True
    )
    def test_get_product_emission_allocations_for_report_version(
        self,
        mock_get_method: MagicMock,
    ):     
        """
        Test that the API correctly returns product emission allocations for a given report version and facility ID.

        Steps:
        - Create and save report products associated with a facility report.
        - Create emission allocations for the report products, associating them with specific emission categories.
        - Mock the response of the `get_emission_allocation_data` service method to simulate the service behavior.
        - Perform a GET request to the API endpoint using a mock authenticated user with the "industry_user" role.
        - Assert that the status code of the API response is 200 (OK).
        - Verify that the service method is called once with the expected parameters.
        - Validate that the API response JSON matches the mocked response structure and content.

        Mocked Service:
        - `get_emission_allocation_data`: Simulates retrieving emission allocation data for the specified 
          `report_version_id` and `facility_id`.

        Notes:
        - Uses the `@patch` decorator to mock external service dependencies.
        """

        # Arrange: Create products and associate them with the report facility
        ReportProductService.save_production_data(
            self.report_version_id,
            self.facility_id,
            self.report_product_data,
            self.test_user_guid,
        )

        # Assert: Report products were created
        report_products = ReportProduct.objects.filter(facility_report=self.facility_report)
        assert report_products.count() == 2, "Expected two report products to be created"

        # Arrange: Create product emission allocations for report facilily products
        flaring_category = EmissionCategory.objects.get(id=1)
        fugitive_category = EmissionCategory.objects.get(id=2)
        emission_data = [
            {"category": flaring_category, "quantity": 1234},
            {"category": fugitive_category, "quantity": 200},
        ]
        for product, data in zip(report_products, emission_data):
            make_recipe(
                "reporting.tests.utils.report_product_emission_allocation",
                report_version=self.facility_report.report_version,
                facility_report=self.facility_report,
                report_product=product,
                emission_category=data["category"],
                allocated_quantity=data["quantity"],
            )

        # Assert: Product emission allocations were created
        allocations = ReportProductEmissionAllocation.objects.filter(facility_report=self.facility_report)
        assert allocations.count() == 2, "Expected two emission allocations to be created"

        # Arrange: Mock the service response        
        mock_response = {
            "report_product_emission_allocations": [],
            "facility_total_emissions": 0.0, 
        }
        for allocation in allocations:
            product = allocation.report_product.product
            emission_category_name = allocation.emission_category.category_name
            allocated_quantity = float(allocation.allocated_quantity)

            mock_response["report_product_emission_allocations"].append({
                "emission_category": emission_category_name,
                "products": [
                    {
                        "product_id": product.id,
                        "product_name": product.name,  
                        "product_emission": allocated_quantity, 
                    }
                ],
                "emission_total": allocated_quantity,  
            })
            mock_response["facility_total_emissions"] += allocated_quantity

        mock_get_method.return_value = mock_response
        
        # Act: Authorize user and perform GET request to get emission allocation data
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_emission_allocations",
                kwargs={"report_version_id": self.report_version_id, "facility_id": self.facility_id},
            ),
        )

        # Assert: Verify response status code
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        # Assert: Verify the service was called with correct parameters
        mock_get_method.assert_called_once_with(self.report_version_id, self.facility_id)

        # Assert: Validate the response structure and details
        response_json = response.json()        
        assert len(response_json["report_product_emission_allocations"]) == len(mock_response["report_product_emission_allocations"]), (
            "Mismatch in the number of emission allocations"
        )
        assert response_json["facility_total_emissions"] == mock_response["facility_total_emissions"], (
            "Facility total emissions do not match"
        )
        for expected, actual in zip(
            mock_response["report_product_emission_allocations"], 
            response_json["report_product_emission_allocations"]
        ):
            assert expected["emission_category"] == actual["emission_category"], "Emission category does not match"
            assert expected["emission_total"] == actual["emission_total"], "Emission total does not match"
            assert len(expected["products"]) == len(actual["products"]), "Mismatch in the number of products"

            for exp_prod, act_prod in zip(expected["products"], actual["products"]):
                assert exp_prod["product_id"] == act_prod["product_id"], "Product ID does not match"
                assert exp_prod["product_name"] == act_prod["product_name"], "Product name does not match"
                assert exp_prod["product_emission"] == act_prod["product_emission"], "Product emission does not match"

    @patch(
        "reporting.service.report_emission_allocation_service.ReportEmissionAllocationService.save_emission_allocation_data", 
        autospec=True
    )
    def test_save_emission_allocation_data(
        self,
        mock_post_method: MagicMock | AsyncMock,
    ):     
        """
        Test that the API correctly saves emission allocation data for a given report version and facility.

        Steps:
        - Create and save report products associated with a facility report.
        - Prepare the payload data for emission allocations.
        - Mock the response of the `save_emission_allocation_data` service method.
        - Perform a POST request to the API endpoint using a mock authenticated user with the "approved_industry_user" role.
        - Assert that the status code of the API response is 200 (OK).
        - Verify that the service method is called once with the expected parameters.
        - Validate that the emission allocation data has been saved correctly.

        Mocked Service:
        - `save_emission_allocation_data`: Simulates saving the emission allocation data.

        Notes:
        - Uses the `@patch` decorator to mock external service dependencies.
        """

        # Arrange: Mock the service response (simulate saving emission allocations)
        mock_post_method.return_value = None

        # Arrange: Create products and associate them with the report facility
        ReportProductService.save_production_data(
            self.report_version_id,
            self.facility_id,
            self.report_product_data,
            self.test_user_guid,
        )

        # Assert: Report products were created
        report_products = ReportProduct.objects.filter(facility_report=self.facility_report)
        assert report_products.count() == 2, "Expected two report products to be created"

        # Prepare payload data for emission allocations
        flaring_category = EmissionCategory.objects.get(id=1)
        fugitive_category = EmissionCategory.objects.get(id=2)
        emission_data = [
            {"category": flaring_category, "quantity": 1234},
            {"category": fugitive_category, "quantity": 200},
        ]

        # Create the payload using the ReportProductEmissionAllocationSchemaIn schema
        payload = [
            ReportProductEmissionAllocationSchemaIn(
                report_version_id=self.report_version_id,
                report_product_id=product.id,
                emission_category_id=data["category"].id,
                allocated_quantity=data["quantity"]
            )
            for product, data in zip(report_products, emission_data)
        ]
        payload_list = [item.dict() for item in payload]

        # Act: Authorize user and perform POST request to save emission allocation data
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_list,
            custom_reverse_lazy(
                "save_emission_allocation_data",
                kwargs={"report_version_id": self.report_version_id, "facility_id": self.facility_id},
            ),
        )
        # Assert: Verify response status code
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        # Assert: Verify the service was called with correct parameters
        mock_post_method.assert_called_once_with
        (
            self.report_version_id,
            self.facility_id,
            payload_list,
            self.test_user_guid,
        )