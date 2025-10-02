from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock
from django.test import Client
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, user_baker
from registration.utils import custom_reverse_lazy
from reporting.models.report import Report
from reporting.models.reporting_year import ReportingYear
from reporting.tests.utils.bakers import report_baker, report_version_baker, reporting_year_baker
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from django.db.models import F
from model_bakery.baker import make_recipe


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
        "reporting.service.reporting_dashboard_service.ReportingDashboardService.get_reports_for_reporting_dashboard"
    )
    @patch("common.api.utils.get_current_user_guid")
    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_returns_report_data_as_provided_by_the_service(
        self,
        mock_get_current_year: MagicMock | AsyncMock,
        mock_get_current_user: MagicMock | AsyncMock,
        mock_get_past_reports: MagicMock | AsyncMock,
    ):

        endpoint_under_test = custom_reverse_lazy("get_dashboard_reports_list")
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

    @patch(
        "reporting.service.reporting_dashboard_service.ReportingDashboardService.get_operations_for_reporting_dashboard"
    )
    @patch("common.api.utils.get_current_user_guid")
    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    def test_returns_operations_data_as_provided_by_the_service(
        self,
        mock_get_current_year: MagicMock | AsyncMock,
        mock_get_current_user: MagicMock | AsyncMock,
        mock_get_operations: MagicMock | AsyncMock,
    ):

        endpoint_under_test = custom_reverse_lazy("get_dashboard_operations_list")
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)

        mock_get_current_year.return_value = ReportingYear.objects.first()
        mock_get_current_user.return_value = approved_user_operator.user

        operations = make_recipe(
            'registration.tests.utils.operation', _quantity=6, operator=approved_user_operator.operator
        )
        for operation in operations:
            _id_counter = 0
            operation.report_id = _id_counter
            operation.report_version_id = _id_counter
            operation.first_report_version_id = _id_counter
            operation.report_status = "draft"
            operation.report_updated_at = datetime.now()
            operation.report_submitted_by = "Test User"
            operation.operation_name = "Mocked Operation Name"
            operation.report_status_sort_key = 0
            operation.save()
            _id_counter += 1
        mock_get_operations.return_value = operations

        response_json = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint_under_test).json()
        assert response_json['count'] == 6
        assert len(response_json['items']) == 6
