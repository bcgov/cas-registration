from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestHistoryV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report = make_recipe("reporting.tests.utils.report")
        self.endpoint_under_test = f"/api/reporting/v2/report/{self.report.id}/history"
        return super().setup_method()

    def test_get_returns_the_right_data_when_empty(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report.operation.operator)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {
            'payload': {'items': [], 'count': 0},
            'report_data': {
                'reporting_year': self.report.reporting_year_id,
                'operation_name': self.report.operation.name,
            },
        }

    def test_get_returns_the_right_data_with_data(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report.operation.operator)
        rv1 = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
            status="Submitted",
            report_type="Annual Report",
            created_at="2024-01-01T12:00:00Z",
        )
        rv2 = make_recipe(
            "reporting.tests.utils.report_version",
            report=self.report,
            status="Draft",
            report_type="Annual Report",
            created_at="2024-02-01T12:00:00Z",
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)
        assert response.json() == {
            'payload': {
                'items': [
                    {
                        'submitted_by': None,
                        'version': 'Current Version',
                        'id': rv2.id,
                        'updated_at': None,
                        'status': "Draft",
                        'report_type': "Annual Report",
                        'is_latest_submitted': False,
                    },
                    {
                        'submitted_by': None,
                        'version': 'Version 1',
                        'id': rv1.id,
                        'updated_at': None,
                        'status': "Submitted",
                        'report_type': "Annual Report",
                        'is_latest_submitted': False,
                    },
                ],
                'count': 2,
            },
            'report_data': {
                'reporting_year': self.report.reporting_year_id,
                'operation_name': self.report.operation.name,
            },
        }
