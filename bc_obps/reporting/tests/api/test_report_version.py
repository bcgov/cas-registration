import json
from typing import Any
from unittest.mock import patch, MagicMock

from django.http import HttpResponse
from model_bakery import baker

from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy
from reporting.models import Report, ReportVersion
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportVersionEndpoint(CommonTestSetup):
  
    @patch("reporting.service.report_version_service.ReportVersionService.get_registration_purpose_by_version_id")
    def test_get_registration_purpose_by_version_id_returns_expected_data(
        self, mock_get_registration_purpose: MagicMock
    ):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        expected_data = {"registration_purpose": "Annual Emissions Report"}
        mock_get_registration_purpose.return_value = expected_data
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_registration_purpose_by_version_id",
                kwargs={"version_id": report_version.id},
            ),
        )

        assert response.status_code == 200
        assert response.json() == expected_data
        mock_get_registration_purpose.assert_called_once_with(report_version.id)
