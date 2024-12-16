from decimal import Decimal
from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn


class TestNewEntrantDataApi(CommonTestSetup):
    def setup_method(self):
        # Set up common test data
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.report_new_entrant = baker.make_recipe(
            'reporting.tests.utils.report_new_entrant', report_version=self.report_version
        )
        self.regulated_product = baker.make_recipe('registration.tests.utils.regulated_product')
        self.emission_category = baker.make_recipe('reporting.tests.utils.emission_category')

        self.report_new_entrant_emission = baker.make_recipe(
            'reporting.tests.utils.report_new_entrant_emission',
            report_new_entrant=self.report_new_entrant,
            emission_category=self.emission_category,
            emission=Decimal('15.0'),
        )
        self.report_new_entrant_production = baker.make_recipe(
            'reporting.tests.utils.report_new_entrant_production',
            report_new_entrant=self.report_new_entrant,
            product=self.regulated_product,
            production_amount=Decimal('100.0'),
        )
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    # """Tests for the get_new_entrant_data endpoint."""
    #
    # @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_new_entrant_data")
    # @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_emissions_data")
    # @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_products_data")
    # def test_returns_new_entrant_data(
    #     self,
    #     mock_get_products_data: MagicMock,
    #     mock_get_emissions_data: MagicMock,
    #     mock_get_new_entrant_data: MagicMock,
    # ):
    #     mock_get_new_entrant_data.return_value = self.report_new_entrant
    #
    #     mock_get_emissions_data.return_value = [self.report_new_entrant_emission]
    #
    #     mock_get_products_data.return_value = [self.report_new_entrant_production]
    #
    #     response = TestUtils.mock_get_with_auth_role(
    #         self,
    #         "industry_user",
    #         custom_reverse_lazy(
    #             "get_new_entrant_data",
    #             kwargs={"report_version_id": self.report_version.id},
    #         ),
    #     )
    #
    #     mock_get_new_entrant_data.assert_called_once()
    #     mock_get_emissions_data.assert_called_once()
    #     mock_get_products_data.assert_called_once()

    """Tests for the save_new_entrant_data endpoint."""

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.save_new_entrant_data")
    def test_saves_new_entrant_data(self, mock_save_new_entrant_data: MagicMock):
        payload = ReportNewEntrantSchemaIn(
            authorization_date="2024-12-01T16:15:00.070Z",
            first_shipment_date="2024-12-01T16:15:01.816Z",
            new_entrant_period_start="2024-12-01T16:15:03.750Z",
            assertion_statement=True,
            products=[
                {
                    "id": 2,
                    "name": "Cement equivalent",
                    "unit": "Tonne cement equivalent",
                    "production_amount": "15.0000",
                },
                {"id": 6, "name": "Gypsum wallboard", "unit": "Thousand square feet", "production_amount": "5.0000"},
                {
                    "id": 7,
                    "name": "Lime at 94.5% CaO and lime kiln dust",
                    "unit": "Tonne lime@94.5% CAO + LKD",
                    "production_amount": "5.0000",
                },
                {"id": 8, "name": "Limestone for sale", "unit": "Tonne limestone", "production_amount": "5.0000"},
            ],
            emissions=[
                {
                    "title": "Emission categories after new entrant period began",
                    "emissionData": [
                        {"id": 1, "name": "Flaring emissions", "emission": "6.0000"},
                        {"id": 2, "name": "Fugitive emissions", "emission": "5.0000"},
                        {"id": 3, "name": "Industrial process emissions", "emission": "9.0000"},
                        {"id": 4, "name": "On-site transportation emissions", "emission": "5.0000"},
                        {"id": 5, "name": "Stationary fuel combustion emissions", "emission": "7.0000"},
                        {"id": 6, "name": "Venting emissions — useful", "emission": "5.0000"},
                        {"id": 7, "name": "Venting emissions — non-useful", "emission": "5.0000"},
                        {"id": 8, "name": "Emissions from waste", "emission": "5.0000"},
                        {"id": 9, "name": "Emissions from wastewater", "emission": "7.0000"},
                    ],
                },
                {
                    "title": "Emissions excluded by fuel type",
                    "emissionData": [
                        {"id": 10, "name": "CO2 emissions from excluded woody biomass", "emission": "5.0000"},
                        {"id": 11, "name": "Other emissions from excluded biomass", "emission": "5.0000"},
                        {"id": 12, "name": "Emissions from excluded non-biomass", "emission": "5.0000"},
                    ],
                },
            ],
        )

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),  # Pass the payload directly as it's already a dictionary
            custom_reverse_lazy(
                "save_new_entrant_data",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify response status
        assert response.status_code == 200
