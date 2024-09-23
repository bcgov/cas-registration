from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.bakers import report_version_baker


class TestReportVersionEndpoint(CommonTestSetup):
    # GET report-operation
    def test_unauthorized_users_cannot_get_report_version(self):
        endpoint_under_test = '/api/reporting/report-version/1/report-operation'

        response = TestUtils.mock_get_with_auth_role(self, "cas_pending", endpoint_under_test)
        assert response.status_code == 401

    def test_authorized_users_can_get_report_version(self):
        report_version = report_version_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

        endpoint_under_test = f'/api/reporting/report-version/{report_version.id}/report-operation'

        for role in ['cas_admin', 'cas_analyst', 'industry_user']:
            response = TestUtils.mock_get_with_auth_role(
                self,
                role,
                f'{endpoint_under_test}',
            )

            assert response.status_code == 200

        # Test that the endpoint returns the correct data
        response_json = response.json()
        assert response_json['operator_legal_name'] == str(report_version.report_operation.operator_legal_name)

    # POST report-operation
    def test_unauthorized_users_cannot_post_report_version(self):
        report_version = report_version_baker()
        endpoint_under_test = f'/api/reporting/report-version/{report_version.id}/report-operation'

        data = {}
        response = TestUtils.mock_post_with_auth_role(self, "cas_pending", self.content_type, data, endpoint_under_test)
        assert response.status_code == 401

    def test_authorized_users_can_post_updates_to_report_version(self):
        report_version = report_version_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)

        endpoint_under_test = f'/api/reporting/report-version/{report_version.id}/report-operation'

        data = {
            "operator_legal_name": "new legal name",
            "operator_trade_name": "new trade name",
            "operation_name": "new operation name",
            "operation_type": "LFO",
            "operation_bcghgid": "new operation bcghgid",
            "bc_obps_regulated_operation_id": "new bc obps regulated operation id",
            "activities": [],
            "regulated_products": [],
            "operation_representative_name": "new operation representative name",
        }

        assert report_version.report_operation.operator_legal_name != data['operator_legal_name']
        assert report_version.report_operation.operator_trade_name != data['operator_trade_name']
        assert report_version.report_operation.operation_name != data['operation_name']
        assert report_version.report_operation.operation_bcghgid != data['operation_bcghgid']
        assert report_version.report_operation.bc_obps_regulated_operation_id != data['bc_obps_regulated_operation_id']
        assert report_version.report_operation.operation_representative_name != data['operation_representative_name']

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', self.content_type, data, endpoint_under_test
        )

        assert response.status_code == 201
        response_json = response.json()

        assert response_json['operator_legal_name'] == data['operator_legal_name']
        assert response_json['operator_trade_name'] == data['operator_trade_name']
        assert response_json['operation_name'] == data['operation_name']
        assert response_json['operation_bcghgid'] == data['operation_bcghgid']
        assert response_json['bc_obps_regulated_operation_id'] == data['bc_obps_regulated_operation_id']
        assert response_json['operation_representative_name'] == data['operation_representative_name']