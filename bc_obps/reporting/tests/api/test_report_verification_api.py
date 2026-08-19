from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_verification import ReportVerificationIn
from reporting.models.report_verification import ReportVerification
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportVerificationApi(CommonTestSetup):
    def setup_method(self):
        # Create ReportVersion instance
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")

        # Create ReportVerification instance associated with the ReportVersion
        self.report_verification = baker.make_recipe(
            "reporting.tests.utils.report_verification",
            report_version=self.report_version,
        )

        # Call parent setup and authorize user
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)
        TestUtils.generate_operation_operator_timeline(
            operator=self.report_version.report.operator, operations=[self.report_version.report.operation]
        )

    """Tests for the get_report_verification_by_version_id endpoint."""

    @patch(
        "reporting.service.report_verification_service.ReportVerificationService.get_report_verification_by_version_id"
    )
    def test_returns_verification_data_for_report_version_id(
        self,
        mock_get_report_verification: MagicMock,
    ):
        # Arrange: Mock report verification data
        mock_get_report_verification.return_value = self.report_verification

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_verification_by_version_id",
                kwargs={"version_id": self.report_version.id},
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
            scope_of_verification="B.C. OBPS Annual Report",
            threats_to_independence=False,
            verification_conclusion="Positive",
        )

        report_version = baker.make_recipe("reporting.tests.utils.report_version")

        # Prepare the mock response with expected data
        mock_response = ReportVerification(
            report_version=report_version,
            verification_body_name=payload.verification_body_name,
            accredited_by=payload.accredited_by,
            scope_of_verification=payload.scope_of_verification,
            threats_to_independence=payload.threats_to_independence,
            verification_conclusion=payload.verification_conclusion,
        )
        mock_response.save()

        # Set the mock return value for the service
        mock_save_report_verification.return_value = mock_response

        # Act: Authorize user and perform POST request
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_report_verification",
                kwargs={"version_id": self.report_version.id},
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

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_verification_by_version_id")
        assert_report_version_ownership_is_validated("get_report_verification_status")
        assert_report_version_ownership_is_validated("save_report_verification", method="post")
