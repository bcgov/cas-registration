from decimal import Decimal
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import patch
from urllib.parse import urlencode
from compliance.models import ComplianceReportVersion
from bc_obps.settings import NINJA_PAGINATION_PER_PAGE

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
    def test_crv_endpoint_unpaginated(self, mock_get_versions):
        # Arrange
        version1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary__report_version__report_operation__operation_name="Test Operation1",
        )
        version1.report_compliance_summary.excess_emissions = Decimal("50.0000")
        version1.report_compliance_summary.save()

        version2 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            report_compliance_summary__report_version__report_operation__operation_name="Test Operation2",
        )
        version2.report_compliance_summary.excess_emissions = Decimal("75.0000")
        version2.report_compliance_summary.save()

        # Return a queryset, not a list
        mock_get_versions.return_value = ComplianceReportVersion.objects.filter(pk__in=[version1.pk, version2.pk])

        TestUtils.authorize_current_user_as_operator_user(self, operator=version1.compliance_report.report.operator)

        resp = TestUtils.mock_get_with_auth_role(self, "industry_user", self._url(paginate_result=False))
        assert resp.status_code == 200
        data = resp.json()
        assert set(data.keys()) == {"count", "items"}
        assert data["count"] == 2

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_versions_for_dashboard"
    )
    def test_crv_endpoint_paginated_two_pages(self, mock_get_versions):
        # Create enough rows for multiple pages; deterministic names for stable sort
        versions = []
        for i in range(45):
            v = make_recipe(
                "compliance.tests.utils.compliance_report_version",
                report_compliance_summary__report_version__report_operation__operation_name=f"Plant {i:03d}",
                # keep a fixed year to avoid any year-based filtering surprises
                report_compliance_summary__report_version__report__reporting_year__reporting_year=2025,
            )
            versions.append(v)

        # Return a queryset
        mock_get_versions.return_value = (
            ComplianceReportVersion.objects.filter(pk__in=[v.pk for v in versions])
            .order_by("operation_name")
        )

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

        # Flip sort on page 2 and ensure the window changes
        resp2_desc = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self._url(page=2, sort_field="operation_name", sort_order="desc")
        )
        assert resp2_desc.status_code == 200
        d2_desc = resp2_desc.json()
        assert len(d2_desc["items"]) == NINJA_PAGINATION_PER_PAGE
        page2_first_id_desc = d2_desc["items"][0]["id"]
        assert page2_first_id_desc != page2_first_id
