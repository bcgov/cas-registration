from unittest.mock import patch, MagicMock, AsyncMock
from django.test import Client
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, user_baker
from registration.utils import custom_reverse_lazy
from reporting.models.report import Report
from reporting.tests.utils.bakers import report_baker, report_version_baker, reporting_year_baker
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from django.db.models import F


class TestReportingDashboardEndpoints(CommonTestSetup):
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
        endpoint_under_test = "/api/reporting/operations"
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        operations = operation_baker(operator_id=operator.id, _quantity=5)

        # The return value needs empty query sets of the right type for the annotations
        mock_get_operations.return_value = Operation.objects.annotate(
            report_id=Report.objects.values('id'),
            report_version_id=Report.objects.values('report_versions__id'),
            report_status=Report.objects.values('report_versions__status'),
        )

        mock_get_current_year.return_value = reporting_year_baker(reporting_year=1234)
        mock_get_current_user.return_value = user_baker()

        response_json = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint_under_test).json()

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

    @patch(
        "reporting.service.reporting_dashboard_service.ReportingDashboardService.get_past_reports_for_reporting_dashboard"
    )
    @patch("common.api.utils.get_current_user_guid")
    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_returns_past_report_data_as_provided_by_the_service(
        self,
        mock_get_current_year: MagicMock | AsyncMock,
        mock_get_current_user: MagicMock | AsyncMock,
        mock_get_past_reports: MagicMock | AsyncMock,
    ):

        endpoint_under_test = custom_reverse_lazy("get_dashboard_past_reports_list")
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        operations = operation_baker(operator_id=operator.id, _quantity=3)
        current_year = reporting_year_baker(reporting_year=1234)
        last_year = reporting_year_baker(reporting_year=1233)
        laster_year = reporting_year_baker(reporting_year=1232)
        years = [last_year, laster_year]

        for operation in operations:
            for year in years:
                r = report_baker(operator_id=operator.id, operation_id=operation.id, reporting_year=year)
                report_version_baker(report=r)
        reports = Report.objects.filter(
            operator_id=operator.id, reporting_year__reporting_year__lt=current_year.reporting_year
        )

        mock_get_current_year.return_value = current_year
        mock_get_current_user.return_value = user_baker()
        mock_get_past_reports.return_value = Report.objects.filter(operator_id=operator.id).annotate(
            report_id=F('id'),
            operation_name=F('operation__name'),
            report_version_id=F('report_versions__id'),
            report_status=F('report_versions__status'),
        )
        response_json = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint_under_test).json()

        assert response_json['count'] == 6
        assert len(response_json['items']) == 6
        for _, item in enumerate(response_json['items']):
            report = next(rep for rep in reports if rep.id == item['id'])
            assert item['id'] == report.id
            assert item['operation_id'] == str(report.operation.id)
            assert item['operation_name'] == report.operation.name
            assert item['report_id'] == report.id
            assert item['report_version_id'] == report.report_versions.first().id
            assert item['report_status'] == report.report_versions.first().status
