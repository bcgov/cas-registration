from unittest.mock import patch

from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)

VALIDATION_SERVICE_PATH = (
    "reporting.api_v2.forms.report_validation_data.ReportValidationService.validate_report_version"
)


class TestReportValidationV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year__reporting_year=1222,
        )
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
            operation_type="Single Facility Operation",
            naics_code__naics_code=111110,
        )

        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.report_version.id}/forms/validation-data"
        return super().setup_method()

    def test_get_returns_empty_validation_payload_when_no_errors(self):
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        with patch(VALIDATION_SERVICE_PATH) as mock_validate:
            mock_validate.return_value = {}

            response = TestUtils.mock_get_with_auth_role(
                self,
                "industry_user",
                self.endpoint_under_test,
            )

        assert response.json() == {
            "operation_data": {
                "naics_code": self.report_operation.naics_code.naics_code,
                "operation_type": self.report_operation.operation_type,
                "is_operation_opted_out": False,
            },
            "report_data": {
                "report_version_id": self.report_version.id,
                "reporting_year": 1222,
            },
            "payload": {
                "errors": [],
            },
        }

        mock_validate.assert_called_once()

    def test_get_returns_validation_errors_with_context(self):
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        facility_id = "f486f2fb-62ed-438d-bb3e-0819b51e3aeb"

        validation_errors = {
            "error_required_fields_non_attributable_emissions_facility_f486f2fb-62ed-438d-bb3e-0819b51e3aeb": ReportValidationError(
                severity=Severity.ERROR,
                message="Required fields are empty.",
                key=ReportValidationErrorKey.ERROR_REQUIRED_FIELDS,
                context=ErrorContext(
                    report_version_id=self.report_version.id,
                    facility_id=facility_id,
                    facility_name="Facility 1",
                    missing_fields=[
                        "Activity name",
                        "Source type",
                        "Emission category",
                        "Gas type",
                    ],
                    section="non_attributable_emissions",
                    section_title="Non-attributable emissions",
                ),
            ),
            "missing_report_verification": ReportValidationError(
                severity=Severity.ERROR,
                message="Verification information must be completed.",
                key=ReportValidationErrorKey.MISSING_REPORT_VERIFICATION,
                context=ErrorContext(
                    report_version_id=self.report_version.id,
                ),
            ),
        }

        with patch(VALIDATION_SERVICE_PATH) as mock_validate:
            mock_validate.return_value = validation_errors

            response = TestUtils.mock_get_with_auth_role(
                self,
                "industry_user",
                self.endpoint_under_test,
            )

        assert response.json() == {
            "operation_data": {
                "naics_code": self.report_operation.naics_code.naics_code,
                "operation_type": self.report_operation.operation_type,
                "is_operation_opted_out": False,
            },
            "report_data": {
                "report_version_id": self.report_version.id,
                "reporting_year": 1222,
            },
            "payload": {
                "errors": [
                    {
                        "key": "error_required_fields",
                        "error": {
                            "severity": "Error",
                            "message": "Required fields are empty.",
                            "context": {
                                "report_version_id": self.report_version.id,
                                "facility_id": facility_id,
                                "facility_name": "Facility 1",
                                "missing_fields": [
                                    "Activity name",
                                    "Source type",
                                    "Emission category",
                                    "Gas type",
                                ],
                                "section": "non_attributable_emissions",
                                "section_title": "Non-attributable emissions",
                            },
                        },
                    },
                    {
                        "key": "missing_report_verification",
                        "error": {
                            "severity": "Error",
                            "message": "Verification information must be completed.",
                            "context": {
                                "report_version_id": self.report_version.id,
                            },
                        },
                    },
                ],
            },
        }

        mock_validate.assert_called_once()

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_validation_data")
