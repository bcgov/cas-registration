from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.service.user_compliance_access_service import UserStatusEnum

# Service path
USER_COMPLIANCE_ACCESS_SERVICE_PATH = "compliance.service.user_compliance_access_service.UserComplianceAccessService"

# Method paths
DETERMINE_USER_STATUS_PATH = f"{USER_COMPLIANCE_ACCESS_SERVICE_PATH}.determine_user_status"

class TestUserComplianceAccessStatusEndPoint(CommonTestSetup):
    def setup_method(self):        
        # Auth setup
        self.compliance_report_version = make_recipe("compliance.tests.utils.compliance_report_version")      
        # Endpoints
        self.endpoint_status = custom_reverse_lazy("get_user_compliance_access_status")
        self.querystring_version_id="?compliance_report_version_id=1"
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.compliance_report_version.compliance_report.report.operator)


    @patch(DETERMINE_USER_STATUS_PATH)
    def test_get_user_compliance_access_status(self, mock_determine_status):
        """Endpoint returns service output."""       
       
        # Mock the service
        mock_determine_status.return_value = UserStatusEnum.REGISTERED.value
        
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self.endpoint_status,
        )

        # Assert
        assert response.status_code == 200
        assert response.json() == {"status": UserStatusEnum.REGISTERED.value}
        mock_determine_status.assert_called_once()