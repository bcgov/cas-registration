from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.models.regulated_product import RegulatedProduct
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportProductEndpoints(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.report_operation = make_recipe("reporting.tests.utils.report_operation", report_version=report_version)

        self.endpoint_under_test = f"/api/reporting/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/production-data"
        return super().setup_method()

    def test_get_returns_the_right_data_when_empty(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {'report_products': [], 'allowed_products': []}

    def test_get_returns_the_right_data_with_data(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        self.report_operation.regulated_products.set(RegulatedProduct.objects.filter(id__in=[1, 2, 3]))
        rp1 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.facility_report.report_version,
            facility_report=self.facility_report,
            product_id=1,
        )
        rp2 = make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.facility_report.report_version,
            facility_report=self.facility_report,
            product_id=2,
            storage_quantity_start_of_period=123,
            storage_quantity_end_of_period=234,
            quantity_sold_during_period=345,
            quantity_throughput_during_period=456,
        )

        # ❌ Report product with a different report version (should NOT be in the response)
        make_recipe(
            "reporting.tests.utils.report_product",
            report_version=make_recipe("reporting.tests.utils.report_version"),  # Different report version
            facility_report=self.facility_report,
            product_id=3,
        )

        # ❌ Report product with a different facility (should NOT be in the response)
        make_recipe(
            "reporting.tests.utils.report_product",
            report_version=self.facility_report.report_version,
            facility_report=make_recipe("reporting.tests.utils.facility_report"),  # Different facility
            product_id=4,
        )

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)

        # ✅ Check that only rp1 and rp2 are returned, not different version or different facility
        assert response.json() == {
            "report_products": [
                {
                    "product_id": rp1.product.id,
                    "product_name": rp1.product.name,
                    "unit": rp1.product.unit,
                    "is_regulated": rp1.product.is_regulated,
                    "annual_production": rp1.annual_production,
                    "production_data_apr_dec": rp1.production_data_apr_dec,
                    "production_methodology": rp1.production_methodology,
                },
                {
                    "product_id": rp2.product.id,
                    "product_name": rp2.product.name,
                    "unit": rp2.product.unit,
                    "is_regulated": rp2.product.is_regulated,
                    "annual_production": rp2.annual_production,
                    "production_data_apr_dec": rp2.production_data_apr_dec,
                    "production_methodology": rp2.production_methodology,
                    "storage_quantity_start_of_period": rp2.storage_quantity_start_of_period,
                    "storage_quantity_end_of_period": rp2.storage_quantity_end_of_period,
                    "quantity_sold_during_period": rp2.quantity_sold_during_period,
                    "quantity_throughput_during_period": rp2.quantity_throughput_during_period,
                },
            ],
            "allowed_products": [
                {
                    "id": 1,
                    "name": RegulatedProduct.objects.get(id=1).name,
                    "unit": RegulatedProduct.objects.get(id=1).unit,
                    "is_regulated": RegulatedProduct.objects.get(id=1).is_regulated,
                },
                {
                    "id": 2,
                    "name": RegulatedProduct.objects.get(id=2).name,
                    "unit": RegulatedProduct.objects.get(id=2).unit,
                    "is_regulated": RegulatedProduct.objects.get(id=2).is_regulated,
                },
                {
                    "id": 3,
                    "name": RegulatedProduct.objects.get(id=3).name,
                    "unit": RegulatedProduct.objects.get(id=3).unit,
                    "is_regulated": RegulatedProduct.objects.get(id=3).is_regulated,
                },
            ],
        }

    @patch("reporting.service.report_product_service.ReportProductService.save_production_data")
    def test_post_calls_the_save_service_with_the_right_data(self, mock_save: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )

        payload = [
            {
                "product_id": 1234567,
                "annual_production": 1111,
                "production_data_apr_dec": 2222,
                "production_methodology": "method",
            },
        ]

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', 'application/json', payload, self.endpoint_under_test
        )
        assert response.status_code == 200
        mock_save.assert_called_once_with(
            self.facility_report.report_version_id,
            self.facility_report.facility_id,
            [
                {
                    "product_id": 1234567,
                    "annual_production": 1111.0,
                    "production_data_apr_dec": 2222.0,
                    "production_methodology": "method",
                    "production_methodology_description": None,
                    "quantity_sold_during_period": None,
                    "quantity_throughput_during_period": None,
                    "storage_quantity_end_of_period": None,
                    "storage_quantity_start_of_period": None,
                }
            ],
            self.user.user_guid,
        )

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("load_production_data", facility_id="uuid")
        assert_report_version_ownership_is_validated("save_production_data", method="post", facility_id="uuid")
