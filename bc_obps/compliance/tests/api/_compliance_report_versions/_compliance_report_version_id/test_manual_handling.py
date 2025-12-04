from unittest.mock import Mock, patch
from django.test import SimpleTestCase, override_settings, Client

from registration.models.user import User
from registration.utils import custom_reverse_lazy
from compliance.models import ComplianceReportVersionManualHandling

VALIDATE_PERMISSION_PATH = "common.permissions.validate_all"
GET_SERVICE_PATH = (
    "compliance.service.compliance_report_version_manual_handling_service."
    "ComplianceManualHandlingService.get_manual_handling_by_report_version"
)
UPDATE_SERVICE_PATH = (
    "compliance.service.compliance_report_version_manual_handling_service."
    "ComplianceManualHandlingService.update_manual_handling"
)
GET_CURRENT_USER_PATH = (
    "compliance.api._compliance_report_versions._compliance_report_version_id.manual_handling.get_current_user"
)


@override_settings(MIDDLEWARE=[])  # Disable middleware to prevent DB queries
class TestComplianceReportVersionManualHandlingEndpoint(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.client = Client()
        cls.compliance_report_version_id = 123

    def _get_endpoint_url(self):
        return custom_reverse_lazy(
            "get_compliance_report_version_manual_handling",
            kwargs={"compliance_report_version_id": self.compliance_report_version_id},
        )

    def _update_endpoint_url(self):
        return custom_reverse_lazy(
            "update_compliance_report_version_manual_handling",
            kwargs={"compliance_report_version_id": self.compliance_report_version_id},
        )

    def _manual_handling_dict(self, **kwargs):
        return {
            "handling_type": kwargs.get("handling_type", "decreased_obligation"),
            "analyst_comment": kwargs.get("analyst_comment", "Initial analyst comment"),
            "director_decision": kwargs.get(
                "director_decision",
                ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
            ),
            "analyst_submitted_date": kwargs.get("analyst_submitted_date", None),
            "analyst_submitted_by": kwargs.get("analyst_submitted_by", None),
            "director_decision_date": kwargs.get("director_decision_date", None),
            "director_decision_by": kwargs.get("director_decision_by", None),
        }

    # --- GET success ---

    @patch(GET_SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_get_manual_handling_success(self, mock_permission, mock_get_manual_handling):
        mock_permission.return_value = True

        manual_handling = self._manual_handling_dict(
            handling_type="decreased_obligation",
            analyst_comment="Analyst needs to review invoice mismatch",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        mock_get_manual_handling.return_value = manual_handling

        response = self.client.get(self._get_endpoint_url())

        assert response.status_code == 200
        response_data = response.json()

        assert response_data["handling_type"] == "decreased_obligation"
        assert response_data["analyst_comment"] == "Analyst needs to review invoice mismatch"
        assert (
            response_data["director_decision"]
            == ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

        mock_get_manual_handling.assert_called_once_with(self.compliance_report_version_id)

    # --- PUT success ---

    @patch(GET_CURRENT_USER_PATH)
    @patch(UPDATE_SERVICE_PATH)
    @patch(VALIDATE_PERMISSION_PATH)
    def test_update_manual_handling_success(self, mock_permission, mock_update_manual_handling, mock_get_current_user):
        mock_permission.return_value = True

        updated_manual_handling = self._manual_handling_dict(
            analyst_comment="Updated analyst comment",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        mock_update_manual_handling.return_value = updated_manual_handling

        # Current user is a CAS analyst
        user = Mock(spec=User)
        user.is_cas_analyst.return_value = True
        user.is_cas_director.return_value = False
        mock_get_current_user.return_value = user

        payload = {
            "analyst_comment": "Updated analyst comment",
        }

        response = self.client.put(
            self._update_endpoint_url(),
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 200
        response_data = response.json()

        assert response_data["analyst_comment"] == "Updated analyst comment"
        assert (
            response_data["director_decision"]
            == ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

        mock_update_manual_handling.assert_called_once()
        call_args = mock_update_manual_handling.call_args

        # Endpoint calls service with keyword args
        assert call_args.kwargs["compliance_report_version_id"] == self.compliance_report_version_id

        service_payload = call_args.kwargs["payload"]
        assert service_payload["analyst_comment"] == "Updated analyst comment"
        assert "director_decision" in service_payload  # may be None by default

        assert call_args.kwargs["user"] is user
