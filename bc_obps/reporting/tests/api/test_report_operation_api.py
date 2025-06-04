from unittest.mock import patch, MagicMock
from model_bakery import baker

from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.service.report_operation_service import ReportOperationService


class TestReportOperationDataApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.operation = baker.make_recipe("registration.tests.utils.operation")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version
        )

        self.report_operation = {
            "operator_legal_name": "ABC Corp",
            "operator_trade_name": "ABC",
            "operation_name": "Sample Operation",
            "registration_purpose": self.operation.registration_purpose,
            "operation_representative_name": [1, 2],
            "operation_type": self.operation.type,
            "operation_bcghgid": "BC123456",
            "bc_obps_regulated_operation_id": "OBPS-789",
            "activities": [1, 2],
            "regulated_products": [1, 3],
            "report_operation_representatives": [
                {"id": 1, "representative_name": "Bill Blue", "selected_for_report": True},
                {"id": 2, "representative_name": "Bob Brown", "selected_for_report": True},
            ],
            "operation_report_type": "Interim",
            "operation_report_status": "Submitted",
            "operation_id": self.operation.id,
        }
        self.facility_report = {
            "facility_id": self.facility_report.facility_id,
            "operation_type": self.operation.type,
        }
        self.activities = [{"id": 1, "name": "Activity 1", "applicable_to": "TypeA"}]
        self.products = [{"id": 1, "name": "Product A", "is_regulated": True, "unit": "TypeA"}]
        self.reporting_year = MagicMock()
        self.reporting_year.reporting_year = 2024

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch.object(ReportOperationService, "get_report_operation_data_by_version_id")
    def test_returns_report_operation_data(self, mock_get_report_operation_data):
        mock_get_report_operation_data.return_value = {
            "report_operation": self.report_operation,
            "facility_id": self.facility_report["facility_id"],
            "all_activities": self.activities,
            "all_regulated_products": self.products,
            "all_representatives": self.report_operation["report_operation_representatives"],
            "report_type": self.report_operation["operation_report_type"],
            "show_regulated_products": True,
            "show_boro_id": True,
            "show_activities": True,
            "reporting_year": self.reporting_year.reporting_year,
        }
        expected_purpose = self.report_operation["registration_purpose"]

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_operation_data",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        response_json = response.json()
        assert response_json["report_operation"]["operation_name"] == self.report_operation["operation_name"]
        assert response_json["all_activities"] == self.activities
        assert response_json["all_regulated_products"] == self.products
        assert response_json["report_type"] == self.report_operation["operation_report_type"]
        assert response_json["reporting_year"] == self.reporting_year.reporting_year

        assert response_json["show_regulated_products"] == (
            expected_purpose
            not in [
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                Operation.Purposes.REPORTING_OPERATION,
                Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
            ]
        )
        assert response_json["show_boro_id"] == (
            expected_purpose
            not in [
                Operation.Purposes.REPORTING_OPERATION,
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            ]
        )
        assert response_json["show_activities"] == (
            expected_purpose
            not in [
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
            ]
        )

        assert response_json["all_representatives"] == self.report_operation["report_operation_representatives"]

    @patch("reporting.service.report_operation_service.ReportOperationService.update_report_operation")
    def test_update_report_operation(self, mock_update: MagicMock):
        report_version = baker.make_recipe("reporting.tests.utils.report_version")
        report_operation = baker.make_recipe("reporting.tests.utils.report_operation", report_version=report_version)
        updated_report_operation = baker.prepare(
            'reporting.ReportOperation', id=report_operation.id, operation_name="UPDATED"
        )

        mock_update.return_value = updated_report_operation

        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
        TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy(
                "get_update_report",
                kwargs={"version_id": report_version.id},
            ),
        )
        mock_update.assert_called_once_with(report_operation.report_version_id)
