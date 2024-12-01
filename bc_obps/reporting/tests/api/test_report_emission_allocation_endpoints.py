from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportEmissionAllocationEndpoints(CommonTestSetup):
    def setup_method(self):
        self.test_infrastructure = TestInfrastructure.build()
        report_version = self.test_infrastructure.report_version
        self.facility_report = self.test_infrastructure.facility_report
        self.report_operation = make_recipe("reporting.tests.utils.report_operation", report_version=report_version)

        self.endpoint_under_test = f"/api/reporting/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/allocate-emissions"
        return super().setup_method()

    def test_get_returns_the_right_data_when_empty(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {
            "report_product_emission_allocations": [
                {
                    "emission_category": "flaring",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "fugitive",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "industrial_process",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "onsite",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "stationary",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "venting_useful",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "venting_non_useful",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "waste",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "wastewater",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "woody_biomass",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "excluded_biomass",
                    "products": [],
                    "emission_total": 0
                },
                {
                    "emission_category": "excluded_non_biomass",
                    "products": [],
                    "emission_total": 0
                }
            ],
        }

    def test_get_returns_the_right_data_when_not_empty(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
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
            json_data={"equivalentEmission": 99.4151},
        )

        # id 1 = Flaring
        report_emission.emission_categories.set([1])
        report_emission_2.emission_categories.set([1])
        # id 2 = Woody Biomass (should not be double counted)
        report_emission_2.emission_categories.set(
            [
                1,
            ]
        )




        emissions_data = [
            {"emission": 200, "carbonateType": "Limestone", "equivalentEmission": "200.0000"},
            {"emission": 300, "gasType": "CH4", "equivalentEmission": "333.3333"},
            {"emission": 111, "gasType": "CO2", "equivalentEmission": "111.0000"},
        ]
        report_products = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.facility_report.report_version,
            facility_report=self.facility_report,
            product_id=seq(1),
            _quantity=3,
        )

        allocation1 = make_recipe(
            "reporting.tests.utils.report_product_emission_allocation",
            report_version=self.facility_report.report_version,
            facility_report=self.facility_report,
            report_product=report_products[0],
            emission_category=report_emission.emission_categories.first(),
            allocated_quantity="22.222",
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        print(response.json())
        assert response.json() == {
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
            }
