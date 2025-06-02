import pytest
from model_bakery import baker
from registration.models import Operation
from reporting.service.report_operation_service import ReportOperationService

pytestmark = pytest.mark.django_db


class TestReportOperationService:
    def setup_method(self):
        self.operator = baker.make_recipe("registration.tests.utils.operator")
        self.operation = baker.make_recipe("registration.tests.utils.operation", operator=self.operator)
        self.report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=baker.make_recipe("reporting.tests.utils.report", operation=self.operation),
            report_type="Annual Report",
            status="Draft",
        )
        self.report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )
        self.representative = baker.make_recipe(
            "reporting.tests.utils.report_operation_representative",
            report_version=self.report_version,
            selected_for_report=True,
        )
        self.activity = baker.make_recipe("registration.tests.utils.activity")
        self.regulated_product = baker.make_recipe("registration.tests.utils.regulated_product")
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report", report_version=self.report_version
        )

    def test_get_report_operation_data_by_version_id(self):
        result = ReportOperationService.get_report_operation_data_by_version_id(self.report_version.id)
        assert result["reportOperation"]["id"] == self.report_operation.id
        assert result["facilityId"] is not None
        assert any(act["id"] == self.activity.id for act in result["allActivities"])
        assert self.regulated_product in list(result["allRegulatedProducts"])
        assert self.representative in result["allRepresentatives"]
        assert result["reportType"] == "Annual Report"
        assert result["showRegulatedProducts"] is True
        assert result["showBoroId"] is True
        assert result["showActivities"] is True

    def test_update_report_service(self):
        self.operation.name = "New Operation Name"
        self.operation.registration_purpose = Operation.Purposes.REPORTING_OPERATION
        self.operation.save()

        ReportOperationService.update_report_operation(self.report_version.id)

        self.report_operation.refresh_from_db()
        assert self.report_operation.operation_name == "New Operation Name"
        assert self.report_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
