
from decimal import Decimal
from model_bakery.baker import make_recipe
from unittest.mock import  patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from registration.models.regulated_product import RegulatedProduct

class TestReportEmissionAllocationApi(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe('reporting.tests.utils.report_version')
        make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            regulated_products=RegulatedProduct.objects.filter(id__in=[29, 1]),
        )
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.report_version_id = self.facility_report.report_version.id
        self.facility_uuid = self.facility_report.facility.id  
        self.mock_get_response = {'report_product_emission_allocations': [{'emission_category': 'Flaring emissions', 'products': [{'product_id': 29, 'product_name': 'Sugar: solid', 'product_emission': 1234.0}], 'emission_total': 1234.0}, {'emission_category': 'Flaring emissions', 'products': [{'product_id': 1, 'product_name': 'BC-specific refinery complexity throughput', 'product_emission': 200.0}], 'emission_total': 200.0}], 'facility_total_emissions': 1434.0}
        self.mock_post_payload =[{'allocated_quantity': Decimal('1234'), 'report_version_id': 2, 'report_product_id': 1, 'emission_category_name': 'Flaring emissions'}, {'allocated_quantity': Decimal('200'), 'report_version_id': 2, 'report_product_id': 2, 'emission_category_name': 'Fugitive emissions'}]
        
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

        # Arrange: Mock the service response  
        mock_get_method.return_value =self.mock_get_response

        # Act: Authorize user and perform GET request to get emission allocation data
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_emission_allocations",
                kwargs={"report_version_id": self.report_version_id, "facility_id": self.facility_uuid},
            ),
        )
        # Assert: Verify response status code
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        # Assert: Verify the service was called with correct parameters
        mock_get_method.assert_called_once_with(self.report_version_id, self.facility_uuid)

        # Assert: Validate the response structure and details
        response_json = response.json()        
        assert len(response_json["report_product_emission_allocations"]) == len(self.mock_get_response["report_product_emission_allocations"]), (
            "Mismatch in the number of emission allocations"
        )
        assert response_json["facility_total_emissions"] == self.mock_get_response["facility_total_emissions"], (
            "Facility total emissions do not match"
        )
        for expected, actual in zip(
            self.mock_get_response["report_product_emission_allocations"], 
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
        - Mock the payload to the `save_emission_allocation_data` service method.
        - Perform a POST request to the API endpoint using a mock authenticated user with the "approved_industry_user" role.
        - Assert that the status code of the API response is 200 (OK).
        - Verify that the service method is called once with the expected parameters.
        - Validate that the emission allocation data has been saved correctly.

        Mocked Service:
        - `save_emission_allocation_data`: Simulates saving the emission allocation data.

        Notes:
        - Uses the `@patch` decorator to mock external service dependencies.
        """

        # Act: Authorize user and perform POST request to save emission allocation data
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.mock_post_payload,
            custom_reverse_lazy(
                "save_emission_allocation_data",
                kwargs={"report_version_id": self.report_version_id, "facility_id": self.facility_uuid},
            ),
        )
        # Assert: Verify response status code
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        # Assert: Verify the service was called with correct parameters
        mock_post_method.assert_called_once_with
        (
            self.report_version_id,
            self.facility_uuid,
            self.mock_post_payload,
            self.test_user_guid,
        )
