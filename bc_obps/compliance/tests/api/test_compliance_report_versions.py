from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch
from urllib.parse import urlencode
from compliance.models import ComplianceReportVersion
from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from reporting.models.reporting_year import ReportingYear
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper


class TestComplianceReportVersionsEndpoint(CommonTestSetup):
    # Base endpoint once; reuse in tests
    endpoint = custom_reverse_lazy("get_compliance_report_versions_list")

    def _url(self, **params) -> str:
        """Build the endpoint URL with optional query params."""
        if not params:
            return self.endpoint
        return f"{self.endpoint}?{urlencode(params)}"

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_versions_for_dashboard"
    )
    def test_crv_endpoint_industry_user(self, mock_get_versions):

        operator = make_recipe('registration.tests.utils.operator')
        test_data1 = ComplianceTestHelper.build_test_data()
        test_data2 = ComplianceTestHelper.build_test_data()
        test_data1.operation.operator = operator
        test_data1.report.operator = operator
        test_data1.operation.save()
        test_data1.report.save()
        test_data2.operation.operator = operator
        test_data2.report.operator = operator
        test_data2.operation.save()
        test_data2.report.save()

        # Return a queryset, not a list
        mock_get_versions.return_value = ComplianceReportVersion.objects.filter(
            pk__in=[test_data1.compliance_report_version.pk, test_data2.compliance_report_version.pk]
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        resp = TestUtils.mock_get_with_auth_role(self, "industry_user", self._url(paginate_result=False))
        assert resp.status_code == 200
        data = resp.json()
        assert set(data.keys()) == {"count", "items"}
        assert data["count"] == 2

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_versions_for_dashboard"
    )
    def test_crv_endpoint_cas_user_paginated(self, mock_get_versions):
        # Create enough rows for multiple pages; deterministic names for stable sort
        versions = []
        reporting_year_2025 = ReportingYear.objects.get(reporting_year=2025)
        for i in range(45):
            v = make_recipe(
                "compliance.tests.utils.compliance_report_version",
                report_compliance_summary__report_version__report_operation__operation_name=f"Plant {i:03d}",
                compliance_report__report__reporting_year=reporting_year_2025,
            )
            versions.append(v)

        # Return a queryset
        mock_get_versions.return_value = ComplianceReportVersion.objects.filter(pk__in=[v.pk for v in versions])

        # Page 1
        resp1 = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self._url(sort_field="operation_name", sort_order="asc")
        )
        assert resp1.status_code == 200
        d1 = resp1.json()
        assert set(d1.keys()) == {"count", "items"}
        assert d1["count"] == 45
        assert len(d1["items"]) == NINJA_PAGINATION_PER_PAGE
        page1_first_id = d1["items"][0]["id"]

        # Page 2, same sort
        resp2 = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self._url(page=2, sort_field="operation_name", sort_order="asc")
        )
        assert resp2.status_code == 200
        d2 = resp2.json()
        assert d2["count"] == 45
        assert len(d2["items"]) == NINJA_PAGINATION_PER_PAGE
        page2_first_id = d2["items"][0]["id"]

        # First item on page 1 should differ from first item on page 2
        assert page1_first_id != page2_first_id
