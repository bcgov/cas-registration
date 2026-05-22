from decimal import Decimal
from unittest.mock import patch
from pytest import approx

from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.service.compliance_service.compliance_service import (
    ComplianceData,
    ReportProductComplianceData,
    RegulatoryValues,
)


class TestComplianceSummaryFormV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year__reporting_year=2222,
        )

        self.naics_code = make_recipe(
            "reporting.tests.utils.naics_code",
            naics_code="12345",
        )

        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
            operation_type="SFO",
            naics_code=self.naics_code,
        )

        self.endpoint_under_test = (
            f"/api/reporting/v2/report-version/{self.report_version.id}/forms/compliance-summary-data"
        )

        super().setup_method()

    @patch("reporting.api_v2.forms.report_compliance_summary_data.ComplianceService.get_calculated_compliance_data")
    def test_authorized_user_can_get_compliance_summary(self, mock_get_calculated_compliance_data):
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        mock_product = ReportProductComplianceData(
            name="Test Product",
            unit="tonnes of product",
            product_id=1,
            annual_production=Decimal("5000.0"),
            jan_mar_production=None,
            apr_dec_production=Decimal("4000.0"),
            emission_intensity=Decimal("1.5"),
            allocated_industrial_process_emissions=Decimal("1.0"),
            allocated_compliance_emissions=Decimal("2.0"),
            reduction_factor_override=None,
            tightening_rate_override=None,
        )

        mock_compliance_data = ComplianceData(
            emissions_attributable_for_reporting=Decimal("100.0"),
            reporting_only_emissions=Decimal("10.0"),
            emissions_attributable_for_compliance=Decimal("90.0"),
            emissions_limit=Decimal("80.0"),
            excess_emissions=Decimal("10.0"),
            credited_emissions=Decimal("0.0"),
            industry_regulatory_values=RegulatoryValues(
                initial_compliance_period=2024,
                compliance_period=2024,
                reduction_factor=Decimal("0.9"),
                tightening_rate=Decimal("0.01"),
            ),
            products=[mock_product],
        )

        mock_get_calculated_compliance_data.return_value = mock_compliance_data
        expected_payload = ComplianceDataSchemaOut.model_validate(
            mock_compliance_data,
            from_attributes=True,
        ).model_dump(exclude_none=True)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self.endpoint_under_test,
        )

        assert response.status_code == 200

        body = response.json()

        assert body["report_data"] == {
            "report_version_id": self.report_version.id,
            "reporting_year": 2222,
        }

        assert body["operation_data"]["naics_code"] == self.report_operation.naics_code.naics_code
        assert body["operation_data"]["operation_type"] == self.report_operation.operation_type
        assert "is_operation_opted_out" in body["operation_data"]

        payload = body["payload"]
        assert payload == expected_payload

        assert payload["regulatory_values"] == {
            "initial_compliance_period": 2024,
            "compliance_period": 2024,
        }

        assert len(payload["products"]) == 1
        product = payload["products"][0]
        assert product["name"] == "Test Product"
        assert product["unit"] == "tonnes of product"
        assert product["reduction_factor"] == approx(0.9)
        assert product["tightening_rate"] == approx(0.01)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_compliance_summary_form_data")
