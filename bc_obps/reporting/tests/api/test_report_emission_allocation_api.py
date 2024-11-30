from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from unittest.mock import  patch, MagicMock
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure

from registration.utils import custom_reverse_lazy

from registration.tests.utils.helpers import CommonTestSetup, TestUtils

class TestReportEmissionAllocationApi(CommonTestSetup):
    def setup_method(self):
        test_infrastructure = TestInfrastructure.build()
        self.facility_report = test_infrastructure.facility_report
      
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=test_infrastructure.report_version.report.operator)

    @patch(
    "reporting.service.report_emission_allocation_service.ReportEmissionAllocationService.get_emission_allocation_data", autospec=True
    )
    def test_returns_product_emission_allocations_for_report_version_id(
    self,
    mock_get_method: MagicMock,
    ):
        # Arrange: Mock the response
        mock_get_method.return_value = {
            "report_product_emission_allocations":[
                {
                    "emission_category":"flaring",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"fugitive",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"industrial_process",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"onsite",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"stationary",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"venting_useful",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"venting_non_useful",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"waste",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"wastewater",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"woody_biomass",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"excluded_biomass",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                },
                {
                    "emission_category":"excluded_non_biomass",
                    "products":[
                        {
                        "product_id":1,
                        "product_name":"BC-specific refinery complexity throughput",
                        "product_emission":0
                        }
                    ],
                    "emission_total":0
                }
            ],
            "facility_total_emissions":0
            }
        
        # Act: Perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_emission_allocations",
                kwargs={"report_version_id": self.facility_report.report_version_id, "facility_id": self.facility_report.facility_id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called and with the correct parameters
        mock_get_method.assert_called_once_with(self.facility_report.report_version_id, self.facility_report.facility_id)
    
        # Assert: Validate the response structure and data
        # response_json = response.json() 
        # assert response_json ==