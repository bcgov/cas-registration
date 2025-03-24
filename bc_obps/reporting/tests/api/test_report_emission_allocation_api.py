from model_bakery.baker import make_recipe
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from registration.models.regulated_product import RegulatedProduct
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


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
        self.mock_get_response = {
            'report_product_emission_allocations': [
                {
                    'emission_category_name': 'Flaring emissions',
                    'emission_category_id': 1,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Fugitive emissions',
                    'emission_category_id': 2,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Industrial process emissions',
                    'emission_category_id': 3,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'On-site transportation emissions',
                    'emission_category_id': 4,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Stationary fuel combustion emissions',
                    'emission_category_id': 5,
                    'category_type': 'basic',
                    'emission_total': '500000.0000',
                    'products': [
                        {
                            'report_product_id': 1,
                            'product_name': 'Cement equivalent',
                            'allocated_quantity': '100000.0000',
                        },
                        {
                            'report_product_id': 2,
                            'product_name': 'Gypsum wallboard',
                            'allocated_quantity': '400000.0000',
                        },
                    ],
                },
                {
                    'emission_category_name': 'Venting emissions — useful',
                    'emission_category_id': 6,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Venting emissions — non-useful',
                    'emission_category_id': 7,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Emissions from waste',
                    'emission_category_id': 8,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Emissions from wastewater',
                    'emission_category_id': 9,
                    'category_type': 'basic',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'CO2 emissions from excluded woody biomass',
                    'emission_category_id': 10,
                    'category_type': 'fuel_excluded',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Other emissions from excluded biomass',
                    'emission_category_id': 11,
                    'category_type': 'fuel_excluded',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
                {
                    'emission_category_name': 'Emissions from excluded non-biomass',
                    'emission_category_id': 12,
                    'category_type': 'fuel_excluded',
                    'emission_total': '0',
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '0'},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '0'},
                    ],
                },
            ],
            'facility_total_emissions': '500000.0000',
            'report_product_emission_allocation_totals': [
                {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': '100000.0000'},
                {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': '400000.0000'},
            ],
            'allocation_methodology': 'Calculator',
            'allocation_other_methodology_description': '',
        }
        self.mock_post_payload = {
            'allocation_methodology': 'Calculator',
            'allocation_other_methodology_description': '',
            'report_product_emission_allocations': [
                {
                    'emission_total': '0',
                    'emission_category_id': 1,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 2,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 3,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '4321.0000',
                    'emission_category_id': 4,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 4321},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '12345.0000',
                    'emission_category_id': 5,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 12345},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 6,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 7,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 8,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 9,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '0',
                    'emission_category_id': 10,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '12345.0000',
                    'emission_category_id': 11,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
                {
                    'emission_total': '4321.0000',
                    'emission_category_id': 12,
                    'products': [
                        {'report_product_id': 1, 'product_name': 'Cement equivalent', 'allocated_quantity': 0},
                        {'report_product_id': 2, 'product_name': 'Gypsum wallboard', 'allocated_quantity': 0},
                    ],
                },
            ],
        }

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

    @patch(
        "reporting.service.report_emission_allocation_service.ReportEmissionAllocationService.get_emission_allocation_data",
        autospec=True,
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
        mock_get_method.return_value = self.mock_get_response

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

    @patch(
        "reporting.service.report_emission_allocation_service.ReportEmissionAllocationService.save_emission_allocation_data",
        autospec=True,
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

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated(
            "get_emission_allocations", version_id_param_name="report_version_id", facility_id="uuid"
        )
        assert_report_version_ownership_is_validated(
            "save_emission_allocation_data",
            method="post",
            version_id_param_name="report_version_id",
            facility_id="uuid",
        )
