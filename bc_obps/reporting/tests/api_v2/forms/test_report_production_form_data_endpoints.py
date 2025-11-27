from model_bakery.baker import make_recipe
from registration.models.regulated_product import RegulatedProduct
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportProductV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version", report__reporting_year__reporting_year=1222
        )
        self.facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
            facility_type="test facility type",
        )
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation", report_version=self.report_version
        )

        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/forms/production-data"
        return super().setup_method()

    def test_get_returns_the_right_data_when_empty(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {
            'facility_data': {
                'facility_type': 'test facility type',
            },
            'report_data': {
                'report_version_id': self.report_version.id,
                'reporting_year': 1222,
            },
            'payload': {'report_products': [], 'allowed_products': []},
        }

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
            production_data_apr_dec=100000,
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
            'facility_data': {
                'facility_type': 'test facility type',
            },
            'report_data': {
                'report_version_id': self.report_version.id,
                'reporting_year': 1222,
            },
            'payload': {
                "report_products": [
                    {
                        "product_id": rp1.product.id,
                        "product_name": rp1.product.name,
                        "unit": rp1.product.unit,
                        "is_regulated": rp1.product.is_regulated,
                        "annual_production": rp1.annual_production,
                        # Production data apr-dec is only serialized when present
                        "production_methodology": rp1.production_methodology.value,
                    },
                    {
                        "product_id": rp2.product.id,
                        "product_name": rp2.product.name,
                        "unit": rp2.product.unit,
                        "is_regulated": rp2.product.is_regulated,
                        "annual_production": rp2.annual_production,
                        "production_data_apr_dec": rp2.production_data_apr_dec,
                        "production_methodology": rp2.production_methodology.value,
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
            },
        }

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_production_form_data", facility_id="uuid")
