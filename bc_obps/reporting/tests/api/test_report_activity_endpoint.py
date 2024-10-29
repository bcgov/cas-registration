import json
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestReportActivityEndpoint(CommonTestSetup):
    """Tests for the report activity endpoint"""

    def setup_method(self):
        """Set up before each test"""
        super().setup_method()
        
        # Create basic test data
        self.facility_report = make_recipe('reporting.tests.utils.facility_report')
        self.activity = make_recipe('reporting.tests.utils.activity')
        
        # Create endpoint
        self.endpoint = (
            f"/api/reporting/report-version/{self.facility_report.report_version.id}"
            f"/facilities/{self.facility_report.facility.id}"
            f"/activity/{self.activity.id}/report-activity"
        )

        # Create test payload
        self.test_payload = {"activity_data": {"test_data": "1"}}

        # Store operator for authorization
        self.operator = self.facility_report.report_version.report.operator

    def _make_request(self, role, authorize_operator=True):
        """Helper method to make a request with given role"""
        if authorize_operator:
            TestUtils.authorize_current_user_as_operator_user(
                self, 
                operator=self.operator
            )

        return TestUtils.mock_post_with_auth_role(
            self,
            role,
            content_type=self.content_type,
            data=json.dumps(self.test_payload),
            endpoint=self.endpoint,
        )
    
    # AUTHORIZATION
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save")
    def test_authorization_matrix(self, mock_service: MagicMock):
        """Test complete authorization matrix for all roles"""
        # Setup mock service for successful requests
        mock_service.return_value = SimpleNamespace(id=12345)

        test_cases = [
            # role, should_authorize_operator, expected_status
            ('cas_pending', False, 401),
            ('cas_analyst', False, 401),
            ('cas_admin', False, 401),
            ('industry_user', True, 200),
        ]

        for role, should_authorize, expected_status in test_cases:
            mock_service.reset_mock()  # Reset mock between tests
            response = self._make_request(
                role=role, 
                authorize_operator=should_authorize
            )
            assert response.status_code == expected_status, \
                f"Role {role} (with authorize_operator={should_authorize}) " \
                f"returned {response.status_code}, expected {expected_status}"
            
            # Verify service calls
            if expected_status == 200:
                mock_service.assert_called_once()
            else:
                mock_service.assert_not_called()
    

    # SERVICE OUTPUT                
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save")
    def test_returns_the_service_output(self, mock_service: MagicMock):
        """Test that the endpoint returns the service's output correctly"""
        # Arrange
        mock_service.return_value = SimpleNamespace(id=12345)

        # Act
        response = self._make_request("industry_user")

        # Assert
        assert response.status_code == 200
        mock_service.assert_called_once_with({"test_data": "1"})
        assert response.json() == 12345

