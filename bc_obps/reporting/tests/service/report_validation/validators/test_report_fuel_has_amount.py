import pytest
from django.test import TestCase
from model_bakery import baker
from reporting.models.report_activity import ReportActivity
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.validators.report_fuel_has_amount import (
    validate,
)
from reporting.tests.service.test_report_activity_save_service.infrastructure import (
    TestInfrastructure,
)


@pytest.mark.django_db
class TestReportFuelHasAmountValidator(TestCase):
    """Tests for the report_fuel_has_amount validator"""

    def setUp(self):
        """Set up test infrastructure"""
        self.test_infrastructure = TestInfrastructure.build()
        self.report_version = self.test_infrastructure.report_version

        self.activity_source_type = self.test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithFuel",  # gitleaks:allow
            has_fuel=True,
        )
        self.report_activity = self.test_infrastructure.make_report_activity()
        self.report_source_type = baker.make_recipe(
            "reporting.tests.utils.report_source_type",
            activity_source_type_base_schema=self.activity_source_type,
            source_type=self.activity_source_type.source_type,
            report_activity=self.report_activity,
            report_version=self.report_version,
        )

        self.report_activity_2 = baker.make(
            ReportActivity,
            activity=self.test_infrastructure.activity,
            activity_base_schema=self.test_infrastructure.activity_json_schema,
            facility_report=baker.make_recipe(
                "reporting.tests.utils.facility_report",
                report_version=self.report_version,
                facility_name="Test Facility 2",
            ),
            report_version=self.test_infrastructure.report_version,
            json_data={"test": "test"},
        )
        self.report_source_type_2 = baker.make_recipe(
            "reporting.tests.utils.report_source_type",
            activity_source_type_base_schema=self.activity_source_type,
            source_type=self.activity_source_type.source_type,
            report_activity=self.report_activity_2,
            report_version=self.test_infrastructure.facility_report.report_version,
        )

    def test_validate_returns_empty_dict_when_all_fuels_have_amount(self):
        baker.make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=self.report_source_type,
            report_version=self.report_version,
            json_data={"annualFuelAmount": 1000},
        )

        result = validate(self.report_version)

        assert result == {}

    def test_validate_returns_error_when_fuel_missing_amount(self):
        baker.make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=self.report_source_type,
            report_version=self.report_version,
            json_data={},
        )

        baker.make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=self.report_source_type_2,
            report_version=self.report_version,
            json_data={"annualFuelAmount": None},
        )

        result = validate(self.report_version)

        assert len(result) == 1

        assert isinstance(result["report_fuel_missing_amount"], ReportValidationError)
        assert result["report_fuel_missing_amount"].severity == Severity.ERROR
        assert (
            result["report_fuel_missing_amount"].key
            == ReportValidationErrorKey.REPORT_FUEL_MISSING_AMOUNT
        )
        assert (
            result["report_fuel_missing_amount"].message
            == """Fuel amount values are missing for the following facilities and activities:

Test Facility 2:
    - Test Infrastructure Activity
This is a testing facility:
    - Test Infrastructure Activity"""
        )

    def test_validate_with_no_fuels_returns_empty_dict(self):
        result = validate(self.report_version)
        assert result == {}
