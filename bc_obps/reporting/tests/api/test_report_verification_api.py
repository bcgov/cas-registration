from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_verification import ReportVerificationIn
from reporting.models.report_verification import ReportVerification


class TestSaveReportVerificationApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.report_verification = baker.make_recipe('reporting.tests.utils.report_verification')

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for the get_report_verification_by_version_id endpoint."""

    @patch(
        "reporting.service.report_verification_service.ReportVerificationService.get_report_verification_by_version_id"
    )
    def test_returns_verification_data_for_report_version_id(
        self,
        mock_get_report_verification: MagicMock,
    ):
        # Arrange: Mock report version and report verification data
        mock_get_report_verification.return_value = self.report_verification

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_verification_by_version_id",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_report_verification.assert_called_once_with(self.report_version.id)

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert response_json["verification_body_name"] == self.report_verification.verification_body_name
        assert response_json["accredited_by"] == self.report_verification.accredited_by
        assert response_json["scope_of_verification"] == self.report_verification.scope_of_verification
        assert response_json["threats_to_independence"] == self.report_verification.threats_to_independence
        assert response_json["verification_conclusion"] == self.report_verification.verification_conclusion
        assert response_json["visit_name"] == self.report_verification.visit_name
        assert response_json["visit_type"] == self.report_verification.visit_type
        assert response_json["other_facility_name"] == self.report_verification.other_facility_name
        assert response_json["other_facility_coordinates"] == self.report_verification.other_facility_coordinates

    """Tests for the get_report_needs_verification endpoint."""

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    def test_returns_verification_needed_for_report_version_id(self, mock_get_report_needs_verification: MagicMock):
        # Arrange: Mock the service to return True
        mock_get_report_needs_verification.return_value = True

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_needs_verification",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_report_needs_verification.assert_called_once_with(self.report_version.id)

        # Assert: Validate the response data
        response_json = response.json()
        assert response_json is True

    @patch("reporting.service.report_verification_service.ReportVerificationService.get_report_needs_verification")
    def test_returns_verification_not_needed_for_report_version_id(self, mock_get_report_needs_verification: MagicMock):
        # Arrange: Mock the service to return False
        mock_get_report_needs_verification.return_value = False

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_needs_verification",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_report_needs_verification.assert_called_once_with(self.report_version.id)

        # Assert: Validate the response data
        response_json = response.json()
        assert response_json is False

    """Tests for the save_report_verification endpoint."""

    @patch("reporting.service.report_verification_service.ReportVerificationService.save_report_verification")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_save_report_verification: MagicMock | AsyncMock,
    ):
        # Arrange: Mock payload and service response
        payload = ReportVerificationIn(
            verification_body_name="Verifier Co.",
            accredited_by="ANAB",  # AccreditedBy choices: "ANAB" or "SCC"
            scope_of_verification="B.C. OBPS Annual Report",  # ScopeOfVerification choices: "B.C. OBPS Annual Report"; "Supplementary Report"; "Corrected Report"
            threats_to_independence=False,
            verification_conclusion="Positive",  # VerificationConclusion choices: "Positive", "Modified", "Negative"
            visit_name="Site Visit 1",
            visit_type="Virtual",  # VisitType choices: "In person", "Virtual"
            other_facility_name=None,
            other_facility_coordinates=None,
        )
        mock_response = ReportVerification(
            report_version=self.report_version,
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
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_report_verification",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with correct arguments
        mock_save_report_verification.assert_called_once_with(self.report_version.id, payload)

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
