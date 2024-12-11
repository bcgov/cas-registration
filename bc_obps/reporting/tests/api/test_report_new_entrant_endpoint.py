from datetime import datetime
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestNewEntrantEndpoints(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_get = f"/api/reporting/report-version/{report_version.id}/new-entrant-data"
        self.endpoint_post = f"/api/reporting/report-version/{report_version.id}/new-entrant-data"
        self.report_version = report_version
        return super().setup_method()

    def test_get_returns_correct_data(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        current_time = datetime.now()

        mock_new_entrant_data = make_recipe(
            "reporting.tests.utils.report_new_entrant",
            authorization_date=current_time,
            first_shipment_date=current_time,
            new_entrant_period_start=current_time,
            assertion_statement=True
        )
        emission_category = make_recipe("reporting.tests.utils.emission_category", category_name="Flaring emissions",
                                        category_type="basic")


        mock_emissions = make_recipe(
            "reporting.tests.utils.report_new_entrant_emissions",
            report_new_entrant=mock_new_entrant_data,
            emission_category=emission_category,
            emission="12.05",
        )

        mock_products = make_recipe("reporting.tests.utils.report_new_entrant_production",
                                    report_new_entrant=mock_new_entrant_data,
                                    production_amount="5.0000")
        mock_naics_code = make_recipe("reporting.tests.utils.naics_code")

        with patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_new_entrant_data",
                   return_value=mock_new_entrant_data), \
                patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_emissions_data",
                      return_value=[mock_emissions]), \
                patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_products_data",
                      return_value=[mock_products]), \
                patch("reporting.service.naics_code.NaicsCodeService.get_naics_code_by_version_id",
                      return_value=str(mock_naics_code)):
            response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_get)
        assert response.status_code == 200

        assert response.json() == {
            "new_entrant_data": {
                "authorization_date": current_time,
                "first_shipment_date": current_time,
                "new_entrant_period_start": current_time,
                "assertion_statement": True
            },
            "emissions": mock_emissions,
            "products": mock_products,
            "naics_code": mock_naics_code,
        }

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.save_new_entrant_data")
    def test_post_saves_data_correctly(self, mock_save: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

        payload = {
            "new_entrant_data": {
                "authorization_date": "2024-01-01",
                "first_shipment_date": "2024-01-15",
                "new_entrant_period_start": "2024-01-01",
                "assertion_statement": "Sample assertion",
            },
            "emissions": [
                {"category": "CO2", "emission": 123.45},
                {"category": "CH4", "emission": 67.89},
            ],
            "products": [
                {"product_id": 1, "production_amount": 100.5},
                {"product_id": 2, "production_amount": 200.75},
            ],
        }

        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", "application/json", payload, self.endpoint_post
        )

        assert response.status_code == 200
        mock_save.assert_called_once_with(self.report_version.id, payload)
