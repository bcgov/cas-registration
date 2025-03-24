from unittest.mock import patch, MagicMock
from django.db.models import DecimalField, Value
from model_bakery import baker
from registration.models.regulated_product import RegulatedProduct
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.models.emission_category import EmissionCategory
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestNewEntrantDataApi(CommonTestSetup):
    def setup_method(self):
        # Set up common test data
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.report_new_entrant = baker.make_recipe(
            'reporting.tests.utils.report_new_entrant',
            report_version=self.report_version,
            authorization_date='2022-01-01',
            first_shipment_date='4999-01-02',
            new_entrant_period_start='1999-01-02',
        )

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for the get_new_entrant_data endpoint."""

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_new_entrant_data")
    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_emissions_data")
    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_products_data")
    def test_returns_new_entrant_data_with_emission_and_production_data_existing(
        self,
        mock_get_products_data: MagicMock,
        mock_get_emissions_data: MagicMock,
        mock_get_new_entrant_data: MagicMock,
    ):
        mock_get_new_entrant_data.return_value = self.report_new_entrant
        mock_get_emissions_data.return_value = EmissionCategory.objects.all().annotate(emission=Value(123))[:3]
        mock_get_products_data.return_value = RegulatedProduct.objects.all().annotate(production_amount=Value(234))[:2]

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_new_entrant_data",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        mock_get_new_entrant_data.assert_called_once()
        mock_get_emissions_data.assert_called_once()
        mock_get_products_data.assert_called_once()

        assert response.json() == {
            'emissions': [
                {
                    'category_name': 'Flaring emissions',
                    'category_type': 'basic',
                    'emission': '123',
                    'id': 1,
                },
                {
                    'category_name': 'Fugitive emissions',
                    'category_type': 'basic',
                    'emission': '123',
                    'id': 2,
                },
                {
                    'category_name': 'Industrial process emissions',
                    'category_type': 'basic',
                    'emission': '123',
                    'id': 3,
                },
            ],
            'naics_code': '486210',
            'new_entrant_data': {
                'assertion_statement': True,
                'authorization_date': '2022-01-01T00:00:00',
                'first_shipment_date': '4999-01-02T00:00:00',
                'id': 1,
                'new_entrant_period_start': '1999-01-02T00:00:00',
            },
            'products': [
                {
                    'id': 1,
                    'name': 'BC-specific refinery complexity throughput',
                    'production_amount': '234',
                    'unit': 'BCRCT',
                },
                {
                    'id': 2,
                    'name': 'Cement equivalent',
                    'production_amount': '234',
                    'unit': 'Tonne cement equivalent',
                },
            ],
        }

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_new_entrant_data")
    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_emissions_data")
    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_products_data")
    def test_returns_new_entrant_data_without_emission_and_production_data_existing(
        self,
        mock_get_products_data: MagicMock,
        mock_get_emissions_data: MagicMock,
        mock_get_new_entrant_data: MagicMock,
    ):
        # annotate with Nones
        mock_get_new_entrant_data.return_value = self.report_new_entrant
        mock_get_emissions_data.return_value = EmissionCategory.objects.all().annotate(
            emission=Value(None, output_field=DecimalField())
        )[:3]
        mock_get_products_data.return_value = RegulatedProduct.objects.all().annotate(
            production_amount=Value(None, output_field=DecimalField())
        )[:2]

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_new_entrant_data",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        mock_get_new_entrant_data.assert_called_once()
        mock_get_emissions_data.assert_called_once()
        mock_get_products_data.assert_called_once()

        assert response.json() == {
            'emissions': [
                {
                    'category_name': 'Flaring emissions',
                    'category_type': 'basic',
                    'id': 1,
                },
                {
                    'category_name': 'Fugitive emissions',
                    'category_type': 'basic',
                    'id': 2,
                },
                {
                    'category_name': 'Industrial process emissions',
                    'category_type': 'basic',
                    'id': 3,
                },
            ],
            'naics_code': '486210',
            'new_entrant_data': {
                'assertion_statement': True,
                'authorization_date': '2022-01-01T00:00:00',
                'first_shipment_date': '4999-01-02T00:00:00',
                'id': 2,
                'new_entrant_period_start': '1999-01-02T00:00:00',
            },
            'products': [
                {
                    'id': 1,
                    'name': 'BC-specific refinery complexity throughput',
                    'unit': 'BCRCT',
                },
                {
                    'id': 2,
                    'name': 'Cement equivalent',
                    'unit': 'Tonne cement equivalent',
                },
            ],
        }

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

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_new_entrant_data", version_id_param_name="report_version_id")
        assert_report_version_ownership_is_validated(
            "save_new_entrant_data", method="post", version_id_param_name="report_version_id"
        )
