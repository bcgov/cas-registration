from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.bakers import report_version_baker
from reporting.schema.report_verification import ReportVerificationIn
from reporting.models.report_verification import ReportVerification

class TestSaveReportVerificationEndpoint(CommonTestSetup):
    """Tests for the save_report_verification endpoint."""

    @patch("reporting.service.report_verification_service.ReportVerificationService.save_report_verification")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_save_report_verification: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint saves the verification data for the given report version ID
        and returns the correct response.
        """

        # Arrange: Mock payload and service response
        report_version = report_version_baker()
        payload = ReportVerificationIn(
            verification_body_name="Verifier Co.",
            accredited_by="ANAB",  # AccreditedBy choices: "ANAB" or "SCC"
            scope_of_verification="B.C. OBPS Annual Report",  # ScopeOfVerification choices
            threats_to_independence=False,
            verification_conclusion="Positive",  # VerificationConclusion choices: "Positive", "Modified", "Negative"
            visit_name="Site Visit 1",
            visit_type="Virtual",  # VisitType choices: "In person", "Virtual"
            other_facility_name=None,
            other_facility_coordinates=None,
        )
        mock_response = ReportVerification(
            report_version=report_version,
            verification_body_name=payload.verification_body_name,
            accredited_by=payload.accredited_by,
            scope_of_verification=payload.scope_of_verification,
            threats_to_independence=payload.threats_to_independence,
            verification_conclusion=payload.verification_conclusion,
            visit_name=payload.visit_name,
            visit_type=payload.visit_type,
            other_facility_name=payload.other_facility_name,
            other_facility_coordinates=payload.other_facility_coordinates,
        )
        mock_save_report_verification.return_value = mock_response

        # Act: Authorize user and perform POST request
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=report_version.report.operator
        )
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_report_verification",
                kwargs={"version_id": report_version.id},
            ),
        )
        
        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with correct arguments
        mock_save_report_verification.assert_called_once_with(
            report_version.id, payload
        )

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert response_json["verification_body_name"] == payload.verification_body_name
        assert response_json["accredited_by"] == payload.accredited_by
        assert response_json["scope_of_verification"] == payload.scope_of_verification
        assert response_json["threats_to_independence"] == payload.threats_to_independence
        assert response_json["verification_conclusion"] == payload.verification_conclusion
        assert response_json["visit_name"] == payload.visit_name
        assert response_json["visit_type"] == payload.visit_type
        assert response_json["other_facility_name"] == payload.other_facility_name
        assert response_json["other_facility_coordinates"] == payload.other_facility_coordinates