from unittest.mock import patch, MagicMock, AsyncMock
from django.test import Client
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, user_baker
from reporting.models.report import Report
from reporting.tests.utils.bakers import reporting_year_baker
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestReportingOperationsEndpoint(CommonTestSetup):
    endpoint_under_test = "/api/reporting/operations"
    client = Client()

    @patch(
        "reporting.service.reporting_dashboard_service.ReportingDashboardService.get_operations_for_reporting_dashboard"
    )
    @patch("common.api.utils.get_current_user_guid")
    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_get_current_year: MagicMock | AsyncMock,
        mock_get_current_user: MagicMock | AsyncMock,
        mock_get_operations: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint returns the proper data.
        Note: the import for the get_current_user_guid mock needs to have the file path of the importing file,
        since this is a module-level function
        """

        operations = operation_baker(_quantity=5)

        # The return value needs empty query sets of the right type for the annotations
        mock_get_operations.return_value = Operation.objects.annotate(
            report_id=Report.objects.values('id'),
            report_version_id=Report.objects.values('report_versions__id'),
            report_status=Report.objects.values('report_versions__status'),
        )

        mock_get_current_year.return_value = reporting_year_baker(reporting_year=1234)
        mock_get_current_user.return_value = user_baker()

        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response_json = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test).json()

        assert response_json['count'] == 5
        assert len(response_json['items']) == 5
        for _, item in enumerate(response_json['items']):
            operation = next(op for op in operations if str(op.id) == item['id'])

            assert item['id'] == str(operation.id)
            assert item['bcghg_id'] == operation.bcghg_id
            assert item['name'] == operation.name
            # The non-none test cases were handled in the service test
            assert item['report_id'] is None
            assert item['report_version_id'] is None
            assert item['report_status'] is None
