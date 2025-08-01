from unittest.mock import patch, MagicMock, AsyncMock
from django.test import Client
from django.db.models import Subquery
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, user_baker
from reporting.models.report import Report
from reporting.tests.utils.bakers import reporting_year_baker
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestReportingOperationsEndpoint(CommonTestSetup):
    # endpoint_under_test = "/api/reporting/operations"
    # endpoint_under_test = custom_reverse_lazy("get_dashboard_operations_list")
    # client = Client()

    # @patch(
    #     "reporting.service.reporting_dashboard_service.ReportingDashboardService.get_operations_for_reporting_dashboard"
    # )
    # @patch("reporting.api.reporting_dashboard.get_current_user_guid")
    # @patch("reporting.api.reporting_dashboard.ReportingYearService.get_current_reporting_year")
    # def test_returns_data_as_provided_by_the_service(
    #     self,
    #     mock_get_current_year: MagicMock | AsyncMock,
    #     mock_get_current_user: MagicMock | AsyncMock,
    #     mock_get_operations: MagicMock | AsyncMock,
    # ):
    #     """
    #     Testing that the API endpoint returns the proper data.
    #     Note: the import for the get_current_user_guid mock needs to have the file path of the importing file,
    #     since this is a module-level function
    #     """
    #     operator = operator_baker()
    #     TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
    #     operations = operation_baker(operator_id=operator.id, _quantity=5)

    #     # The return value needs empty query sets of the right type for the annotations
    #     mock_get_operations.return_value = Operation.objects.filter(id__in=[op.id for op in operations]).annotate(
    #         report_id=Subquery(Report.objects.values('id')[:1]),
    #         report_version_id=Subquery(Report.objects.values('report_versions__id')[:1]),
    #         report_status=Subquery(Report.objects.values('report_versions__status')[:1]),
    #     )
    #     """ mock return_value is missing these fields
    #     operation_id: UUID | None
    #     first_report_version_id: Optional[int] = None
    #     report_submitted_by: Optional[str] = None
    #     operation_name: Optional[str] = None
    #     report_updated_at: Optional[datetime] = None
    #     bcghg_id: Optional[str] = Field(None, alias="bcghg_id.id")
    #     """



    # class Meta:
    #     model = Operation
    #     fields = ["id", "name"]

    #     mock_get_current_year.return_value = reporting_year_baker(reporting_year=1234)
    #     # mock_get_current_user.return_value = user_baker()
    #     mock_get_current_user.return_value = self.user

    #     # response_json = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test).json()
    #     response = TestUtils.mock_get_with_auth_role(self, "industry_user", f"{self.endpoint_under_test}?paginate_result=false")
    #     response_json = response.json()

    #     assert response_json['count'] == 5
    #     assert len(response_json['items']) == 5
    #     for _, item in enumerate(response_json['items']):
    #         operation = next(op for op in operations if str(op.id) == item['id'])

    #         assert item['id'] == str(operation.id)
    #         assert item['bcghg_id'] == operation.bcghg_id
    #         assert item['name'] == operation.name
    #         # The non-none test cases were handled in the service test
    #         assert item['report_id'] is None
    #         assert item['report_version_id'] is None
    #         assert item['report_status'] is None
