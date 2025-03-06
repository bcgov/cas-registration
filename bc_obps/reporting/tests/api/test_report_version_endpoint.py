from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.models import Operation
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.bakers import report_version_baker


class TestReportVersionEndpoint(CommonTestSetup):
    # GET report-operation
    def test_authorized_users_can_get_report_version(self):
        report_version = report_version_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_operation_by_version_id",
                kwargs={"version_id": report_version.id},
            ),
        )
        assert response.status_code == 200
        # Test that the endpoint returns the correct data
        response_json = response.json()
        assert response_json['operator_legal_name'] == str(report_version.report_operation.operator_legal_name)

    # POST report-operation
    def test_authorized_users_can_post_updates_to_report_version(self):
        report_version = report_version_baker(report_type="Simple Report")

        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

        endpoint_under_test = f"/api/reporting/report-version/{report_version.id}/report-operation"

        data = {
            "operator_legal_name": "new legal name",
            "operator_trade_name": "new trade name",
            "operation_name": "new operation name",
            "operation_type": Operation.Types.LFO,
            "operation_bcghgid": "new operation bcghgid",
            "bc_obps_regulated_operation_id": "new bc obps regulated operation id",
            "activities": [],
            "regulated_products": [],
            "operation_report_type": "Annual Report",
            "operation_representative_name": [1, 2],
        }
        assert report_version.report_operation.operator_legal_name != data["operator_legal_name"]
        assert report_version.report_operation.operator_trade_name != data["operator_trade_name"]
        assert report_version.report_operation.operation_name != data["operation_name"]
        assert report_version.report_operation.operation_bcghgid != data["operation_bcghgid"]
        assert report_version.report_operation.bc_obps_regulated_operation_id != data["bc_obps_regulated_operation_id"]
        assert report_version.report_type != data["operation_report_type"]

        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", self.content_type, data, endpoint_under_test
        )

        assert response.status_code == 201
        response_json = response.json()
        assert response_json["operator_legal_name"] == data["operator_legal_name"]
        assert response_json["operator_trade_name"] == data["operator_trade_name"]
        assert response_json["operation_name"] == data["operation_name"]
        assert response_json["operation_bcghgid"] == data["operation_bcghgid"]
        assert response_json["bc_obps_regulated_operation_id"] == data["bc_obps_regulated_operation_id"]

    @patch("service.report_version_service.ReportVersionService.change_report_version_type")
    def test_change_report_version_type(self, mock_change_version_service_method: MagicMock):
        mock_change_version_service_method.return_value = baker.make_recipe(
            "reporting.tests.utils.report_version",
            id=1234,
        )
        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report_type="Annual Report",
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {"report_type": "Simple Report"},
            f"/api/reporting/report-version/{report_version.id}/change-report-type",
        )

        assert response.status_code == 201
        assert response.json() == 1234
