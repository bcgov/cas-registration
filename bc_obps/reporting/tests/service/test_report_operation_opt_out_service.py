import pytest
from model_bakery import baker

from reporting.models import ReportingYear
from reporting.service.report_operation_opt_out_service import (
    JAN_MAR_PRODUCTION_APPLICABLE_YEAR,
    ReportOperationOptOutService,
)
from registration.models.operation import Operation

pytestmark = pytest.mark.django_db


class TestReportOperationOptOutService:
    def setup_method(self):
        self.operator = baker.make_recipe("registration.tests.utils.operator")
        self.operation = baker.make_recipe(
            "registration.tests.utils.operation",
            operator=self.operator,
        )

    def _create_report_version(
        self,
        *,
        reporting_year: int,
        registration_purpose,
        opted_out_final_year,
    ):
        reporting_year_obj, _ = ReportingYear.objects.get_or_create(reporting_year=reporting_year)

        report = baker.make_recipe(
            "reporting.tests.utils.report",
            operation=self.operation,
            operator=self.operator,
            reporting_year=reporting_year_obj,
        )

        report_version = baker.make_recipe(
            "reporting.tests.utils.report_version",
            report=report,
        )

        baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=report_version,
            registration_purpose=registration_purpose,
            operation_opted_out_final_reporting_year=opted_out_final_year,
        )

        return report_version

    def test_is_operation_opted_out_true_when_opted_in_and_year_equal(self):
        report_version = self._create_report_version(
            reporting_year=2025,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=2025,
        )

        result = ReportOperationOptOutService.is_operation_opted_out(report_version)

        assert result is True

    def test_is_operation_opted_out_true_when_opted_in_and_year_before(self):
        report_version = self._create_report_version(
            reporting_year=2026,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=2025,
        )

        result = ReportOperationOptOutService.is_operation_opted_out(report_version)

        assert result is True

    def test_is_operation_opted_out_false_when_not_opted_in(self):
        report_version = self._create_report_version(
            reporting_year=2025,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
            opted_out_final_year=2025,
        )

        result = ReportOperationOptOutService.is_operation_opted_out(report_version)

        assert result is False

    def test_is_operation_opted_out_false_when_no_final_year(self):
        report_version = self._create_report_version(
            reporting_year=2025,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=None,
        )

        result = ReportOperationOptOutService.is_operation_opted_out(report_version)

        assert result is False

    def test_is_operation_opted_out_false_when_final_year_after_reporting_year(self):
        report_version = self._create_report_version(
            reporting_year=2025,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=2026,
        )

        result = ReportOperationOptOutService.is_operation_opted_out(report_version)

        assert result is False

    def test_should_include_jan_mar_production_true_when_year_is_2025_and_opted_out(
        self,
    ):
        report_version = self._create_report_version(
            reporting_year=JAN_MAR_PRODUCTION_APPLICABLE_YEAR,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=JAN_MAR_PRODUCTION_APPLICABLE_YEAR,
        )

        result = ReportOperationOptOutService.should_include_jan_mar_production(report_version)

        assert result is True

    def test_should_include_jan_mar_production_false_when_not_2025(self):
        report_version = self._create_report_version(
            reporting_year=2024,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=2024,
        )

        result = ReportOperationOptOutService.should_include_jan_mar_production(report_version)

        assert result is False

    def test_should_include_jan_mar_production_false_when_not_opted_out(self):
        report_version = self._create_report_version(
            reporting_year=JAN_MAR_PRODUCTION_APPLICABLE_YEAR,
            registration_purpose=Operation.Purposes.OPTED_IN_OPERATION,
            opted_out_final_year=2026,
        )

        result = ReportOperationOptOutService.should_include_jan_mar_production(report_version)

        assert result is False
