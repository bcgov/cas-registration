from unittest.mock import Mock, patch
from django.test import SimpleTestCase, override_settings, Client
from registration.models.user import User
from registration.utils import custom_reverse_lazy
from compliance.models import ComplianceEarnedCredit

PERMISSION_CHECK_PATH = "common.permissions.check_permission_for_role"
GET_SERVICE_PATH = (
    "compliance.service.earned_credits_service.ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version"
)
UPDATE_SERVICE_PATH = "compliance.service.earned_credits_service.ComplianceEarnedCreditsService.update_earned_credit"
GET_CURRENT_USER_PATH = (
    "compliance.api._compliance_report_versions._compliance_report_version_id.earned_credits.get_current_user"
)


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent DB queries
class TestComplianceReportVersionEarnedCreditsEndpoint(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()
        cls.compliance_report_version_id = 123

    def _get_endpoint_url(self):
        return custom_reverse_lazy(
            "get_compliance_report_version_earned_credits",
            kwargs={"compliance_report_version_id": self.compliance_report_version_id},
        )

    def _update_endpoint_url(self):
        return custom_reverse_lazy(
            "update_compliance_report_version_earned_credit",
            kwargs={"compliance_report_version_id": self.compliance_report_version_id},
        )

    def _create_earned_credit_dict(self, **kwargs):
        return {
            "earned_credits_amount": kwargs.get('earned_credits_amount', 100),
            "issuance_status": kwargs.get('issuance_status', ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED),
            "bccr_trading_name": kwargs.get('bccr_trading_name', "Test Trading Name"),
            "bccr_holding_account_id": kwargs.get('bccr_holding_account_id', "123456789012345"),
            "analyst_comment": kwargs.get('analyst_comment', "Test analyst comment"),
            "director_comment": kwargs.get('director_comment', "Test director comment"),
            "analyst_suggestion": kwargs.get('analyst_suggestion', None),
            "analyst_submitted_date": kwargs.get('analyst_submitted_date', None),
            "analyst_submitted_by": kwargs.get('analyst_submitted_by', None),
            "issued_date": kwargs.get('issued_date', None),
            "issued_by": kwargs.get('issued_by', None),
            "issuance_requested_date": kwargs.get('issuance_requested_date', None),
            "compliance_report_version.compliance_report.compliance_period.end_date.year": kwargs.get(
                'reporting_year', 2025
            ),
        }

    @patch(GET_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_get_earned_credits_success(self, mock_permission, mock_get_earned_credits):
        # Arrange
        mock_permission.return_value = True
        earned_credits = self._create_earned_credit_dict(
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="Test Trading Name",
            analyst_comment="Test analyst comment",
            director_comment="Test director comment",
        )
        mock_get_earned_credits.return_value = earned_credits
        # Act
        response = self.client.get(self._get_endpoint_url())

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response structure and data matches ComplianceEarnedCreditsOut schema
        assert response_data["earned_credits_amount"] == 100
        assert response_data["issuance_status"] == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        assert response_data["bccr_trading_name"] == "Test Trading Name"
        assert response_data["analyst_comment"] == "Test analyst comment"
        assert response_data["director_comment"] == "Test director comment"

    @patch(GET_CURRENT_USER_PATH)
    @patch(UPDATE_SERVICE_PATH)
    @patch(PERMISSION_CHECK_PATH)
    def test_update_earned_credits_success(self, mock_permission, mock_update_earned_credit, mock_get_current_user):
        # Arrange
        mock_permission.return_value = True
        earned_credit = self._create_earned_credit_dict(
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="New Trading Name",
            bccr_holding_account_id="123456789012345",
            analyst_suggestion=ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE,
            analyst_comment="Looks good to approve",
            director_comment="Approved for issuance",
        )
        mock_update_earned_credit.return_value = earned_credit
        mock_get_current_user.return_value = Mock(spec=User)
        payload = {
            "bccr_trading_name": "New Trading Name",
            "bccr_holding_account_id": "123456789012345",
            "analyst_suggestion": "Ready to approve",
            "analyst_comment": "Looks good to approve",
            "director_decision": "Approved",
            "director_comment": "Approved for issuance",
        }

        # Act
        response = self.client.put(
            self._update_endpoint_url(),
            data=payload,
            content_type="application/json",
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify response data matches what the service returned
        assert response_data["bccr_trading_name"] == "New Trading Name"
        assert response_data["bccr_holding_account_id"] == "123456789012345"
        assert response_data["analyst_suggestion"] == "Ready to approve"
        assert response_data["analyst_comment"] == "Looks good to approve"
        assert response_data["director_comment"] == "Approved for issuance"
        assert response_data["issuance_status"] == ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED

        # Verify service was called with correct parameters
        mock_update_earned_credit.assert_called_once()
        call_args = mock_update_earned_credit.call_args
        assert call_args[0][0] == self.compliance_report_version_id
        assert call_args[0][1] == payload
        assert call_args[0][2] is not None  # user

    @patch(PERMISSION_CHECK_PATH)
    def test_update_earned_credits_invalid_bccr_holding_account_id_format(self, mock_permission):
        # Arrange
        mock_permission.return_value = True

        # Invalid BCCR holding account ID format (not 15 digits)
        payload = {
            "bccr_trading_name": "New Trading Name",
            "bccr_holding_account_id": "12345",  # Too short
        }

        # Act
        response = self.client.put(
            self._update_endpoint_url(),
            data=payload,
            content_type="application/json",
        )

        # Assert - should fail due to invalid format
        assert response.status_code == 422  # Validation error
