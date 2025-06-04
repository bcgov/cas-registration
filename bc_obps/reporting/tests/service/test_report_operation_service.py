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

    @pytest.mark.parametrize(
        "purpose,expected_flags",
        [
            (
                Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
                {"show_regulated_products": False, "show_boro_id": False, "show_activities": False},
            ),
            (
                Operation.Purposes.REPORTING_OPERATION,
                {"show_regulated_products": False, "show_boro_id": False, "show_activities": True},
            ),
            (
                Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
                {"show_regulated_products": False, "show_boro_id": True, "show_activities": False},
            ),
            (
                Operation.Purposes.OBPS_REGULATED_OPERATION,
                {"show_regulated_products": True, "show_boro_id": True, "show_activities": True},
            ),
        ],
    )
    def test_show_flags_for_registration_purposes(self, purpose, expected_flags):
        self.report_operation.registration_purpose = purpose
        self.report_operation.save()

        result = ReportOperationService.get_report_operation_data_by_version_id(self.report_version.id)

        assert result["show_regulated_products"] is expected_flags["show_regulated_products"]
        assert result["show_boro_id"] is expected_flags["show_boro_id"]
        assert result["show_activities"] is expected_flags["show_activities"]

    def test_get_report_operation_data_by_version_id(self):
        result = ReportOperationService.get_report_operation_data_by_version_id(self.report_version.id)
        assert result["report_operation"]["id"] == self.report_operation.id
        assert result["facility_id"] is not None
        assert any(act["id"] == self.activity.id for act in result["all_activities"])
        assert self.regulated_product in list(result["all_regulated_products"])
        assert self.representative in result["all_representatives"]
        assert result["report_type"] == "Annual Report"
        assert result["show_regulated_products"] is True
        assert result["show_boro_id"] is True
        assert result["show_activities"] is True

    def test_update_report_service(self):
        self.operation.name = "New Operation Name"
        self.operation.registration_purpose = Operation.Purposes.REPORTING_OPERATION
        self.operation.save()

        ReportOperationService.update_report_operation(self.report_version.id)

        self.report_operation.refresh_from_db()
        assert self.report_operation.operation_name == "New Operation Name"
        assert self.report_operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION

    def test_get_report_operation_by_version_id(self):
        result = ReportOperationService.get_report_operation_by_version_id(self.report_version.id)

        assert result["id"] == self.report_operation.id
        assert result["operation_id"] == self.operation.id
        assert result["operation_report_type"] == self.report_version.report_type
        assert result["operation_report_status"] == self.report_version.status
        assert self.representative in result["report_operation_representatives"]
        assert self.representative.id in result["operation_representative_name"]
