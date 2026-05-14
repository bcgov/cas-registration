from unittest.mock import patch
from django.test import TestCase
from model_bakery.baker import make_recipe, make
import pytest
from reporting.models import (
    ReportOperation,
    FuelType,
    ReportFuel,
    ReportMethodology,
    Methodology,
    GasType,
    ReportingField,
)
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
    ReportValidationErrorKey,
    ErrorContext,
)
from reporting.service.report_validation.validators.report_data_by_fuel_type_validator import (
    validate,
)
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure

BASE_PATH = "reporting.service.report_validation.validators.report_data_by_fuel_type_validator"
GET_REPORTING_FIELD_DISPLAY_NAME_PATH = f"{BASE_PATH}.get_reporting_field_display_name"


@pytest.mark.django_db
class TestReportDataByFueltypeValidator(TestCase):

    def setUp(self):
        # Arrange: sets up the report elements necessary to allocate emissions
        self.test_infrastructure = TestInfrastructure.build()

        make(
            ReportOperation,
            report_version=self.test_infrastructure.report_version,
            activities=[self.test_infrastructure.activity],
        )

        activity_source_type = self.test_infrastructure.make_activity_source_type(
            source_type__json_key="sourceTypeWithUnitAndFuel",  # gitleaks:allow
            has_unit=True,
            has_fuel=True,
        )

        report_activity = self.test_infrastructure.make_report_activity()
        report_source_type = make_recipe(
            "reporting.tests.utils.report_source_type",
            activity_source_type_base_schema=activity_source_type,
            source_type=activity_source_type.source_type,
            report_activity=report_activity,
            report_version=self.test_infrastructure.report_version,
            json_data={"test_report_source_type": "yes"},
        )
        report_fuel = make_recipe(
            "reporting.tests.utils.report_fuel",
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            fuel_type=FuelType.objects.get(name='Diesel'),
            json_data={"annualFuelAmount": 1500},
            report_unit=None,
        )
        report_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_fuel=report_fuel,
            report_source_type=report_source_type,
            report_version=self.test_infrastructure.report_version,
            gas_type=GasType.objects.get(chemical_formula='CO2'),
            json_data={"equivalentEmission": 10},
        )
        self.report_methodology = make_recipe(
            "reporting.tests.utils.report_methodology",
            methodology=Methodology.objects.get(name='Default EF'),
            report_emission=report_emission,
            report_version=self.test_infrastructure.report_version,
            json_data={"unitFuelCo2DefaultEf": 2000},
        )

    def test_no_errors_when_values_within_expected_bounds(self):

        result = validate(self.test_infrastructure.report_version)
        assert result == {}

    @patch(GET_REPORTING_FIELD_DISPLAY_NAME_PATH)
    def test_errors_when_fuel_amount_above_expected_bound(self, mock_reporting_field_display_name):
        mock_reporting_field_display_name.return_value = "Annual Fuel Amount"
        ReportFuel.objects.update(json_data={"annualFuelAmount": 250000})
        report_fuel = ReportFuel.objects.first()
        result = validate(self.test_infrastructure.report_version)
        assert result == {
            f"report_fuel_fuel_amount_value_outside_expected_bounds_{report_fuel.id}": ReportValidationError(
                Severity.WARNING,
                f"Fuel Amount value ({report_fuel.json_data['annualFuelAmount']}) is outside of the expected range (0.00 - 200000.00) for Activity: {report_fuel.report_source_type.report_activity.activity.name}, Source Type: {report_fuel.report_source_type.source_type.name}, Fuel Type: Diesel",
                key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE,
                context=ErrorContext(
                    report_version_id=report_fuel.report_version.id,
                    facility_id=report_fuel.report_source_type.report_activity.facility_report.facility_id,
                    facility_name=report_fuel.report_source_type.report_activity.facility_report.facility_name,
                    activity_id=report_fuel.report_source_type.report_activity.activity.id,
                    activity_name=report_fuel.report_source_type.report_activity.activity.name,
                    source_type_id=report_fuel.report_source_type.source_type_id,
                    source_type_name=report_fuel.report_source_type.source_type.name,
                    fuel_type_name=report_fuel.fuel_type.name,
                    reporting_field="Annual Fuel Amount",
                    expected_range="0.00 - 200000.00",
                    user_input=str(report_fuel.json_data["annualFuelAmount"]),
                ),
            )
        }

    @patch(GET_REPORTING_FIELD_DISPLAY_NAME_PATH)
    def test_errors_when_fuel_amount_below_expected_bound(self, mock_reporting_field_display_name):
        mock_reporting_field_display_name.return_value = "Annual Fuel Amount"
        ReportFuel.objects.update(json_data={"annualFuelAmount": -15000})
        report_fuel = ReportFuel.objects.first()
        result = validate(self.test_infrastructure.report_version)
        assert result == {
            f"report_fuel_fuel_amount_value_outside_expected_bounds_{report_fuel.id}": ReportValidationError(
                Severity.WARNING,
                f"Fuel Amount value ({report_fuel.json_data['annualFuelAmount']}) is outside of the expected range (0.00 - 200000.00) for Activity: {report_fuel.report_source_type.report_activity.activity.name}, Source Type: {report_fuel.report_source_type.source_type.name}, Fuel Type: Diesel",
                key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE,
                context=ErrorContext(
                    report_version_id=report_fuel.report_version.id,
                    facility_id=report_fuel.report_source_type.report_activity.facility_report.facility_id,
                    facility_name=report_fuel.report_source_type.report_activity.facility_report.facility_name,
                    activity_id=report_fuel.report_source_type.report_activity.activity.id,
                    activity_name=report_fuel.report_source_type.report_activity.activity.name,
                    source_type_id=report_fuel.report_source_type.source_type_id,
                    source_type_name=report_fuel.report_source_type.source_type.name,
                    fuel_type_name=report_fuel.fuel_type.name,
                    reporting_field="Annual Fuel Amount",
                    expected_range="0.00 - 200000.00",
                    user_input=str(report_fuel.json_data["annualFuelAmount"]),
                ),
            )
        }

    def test_errors_when_methodology_field_above_expected_bound(self):
        ReportMethodology.objects.update(
            json_data={"unitFuelCo2DefaultEf": 20000},
        )
        report_methodology = ReportMethodology.objects.first()
        result = validate(self.test_infrastructure.report_version)
        assert result == {
            f"report_methodology_unitFuelCo2DefaultEf_value_outside_expected_bounds_{report_methodology.id}": ReportValidationError(
                Severity.WARNING,
                f"Methodology Field (CO2 Default Emission Factor) with value (20000) is outside of the expected range (1000.0000 - 5000.0000) for Activity: {report_methodology.report_emission.report_source_type.report_activity.activity.name}, Source Type: {report_methodology.report_emission.report_source_type.source_type.name}, Fuel Type: Diesel, Gas Type: CO2",
                key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD,
                context=ErrorContext(
                    report_version_id=report_methodology.report_version.id,
                    facility_id=report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_id,
                    facility_name=self.test_infrastructure.facility_report.facility_name,
                    activity_id=report_methodology.report_emission.report_source_type.report_activity.activity.id,
                    activity_name=report_methodology.report_emission.report_source_type.report_activity.activity.name,
                    source_type_id=report_methodology.report_emission.report_source_type.source_type_id,
                    source_type_name=report_methodology.report_emission.report_source_type.source_type.name,
                    fuel_type_name=report_methodology.report_emission.report_fuel.fuel_type.name,
                    gas_type_name=report_methodology.report_emission.gas_type.chemical_formula,
                    methodology_name=report_methodology.methodology.name,
                    reporting_field=ReportingField.objects.get(slug='unitFuelCo2DefaultEf').field_display_title,
                    expected_range="1000.0000 - 5000.0000",
                    user_input=str(report_methodology.json_data["unitFuelCo2DefaultEf"]),
                ),
            )
        }

    def test_errors_when_methodology_field_below_expected_bound(self):
        ReportMethodology.objects.update(
            json_data={"unitFuelCo2DefaultEf": 2},
        )
        report_methodology = ReportMethodology.objects.first()
        result = validate(self.test_infrastructure.report_version)
        assert result == {
            f"report_methodology_unitFuelCo2DefaultEf_value_outside_expected_bounds_{report_methodology.id}": ReportValidationError(
                Severity.WARNING,
                f"Methodology Field (CO2 Default Emission Factor) with value (2) is outside of the expected range (1000.0000 - 5000.0000) for Activity: {report_methodology.report_emission.report_source_type.report_activity.activity.name}, Source Type: {report_methodology.report_emission.report_source_type.source_type.name}, Fuel Type: Diesel, Gas Type: CO2",
                key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD,
                context=ErrorContext(
                    report_version_id=report_methodology.report_version.id,
                    facility_id=report_methodology.report_emission.report_source_type.report_activity.facility_report.facility_id,
                    facility_name=self.test_infrastructure.facility_report.facility_name,
                    activity_id=report_methodology.report_emission.report_source_type.report_activity.activity.id,
                    activity_name=report_methodology.report_emission.report_source_type.report_activity.activity.name,
                    source_type_id=report_methodology.report_emission.report_source_type.source_type_id,
                    source_type_name=report_methodology.report_emission.report_source_type.source_type.name,
                    fuel_type_name=report_methodology.report_emission.report_fuel.fuel_type.name,
                    gas_type_name=report_methodology.report_emission.gas_type.chemical_formula,
                    methodology_name=report_methodology.methodology.name,
                    reporting_field=ReportingField.objects.get(slug='unitFuelCo2DefaultEf').field_display_title,
                    expected_range="1000.0000 - 5000.0000",
                    user_input=str(report_methodology.json_data["unitFuelCo2DefaultEf"]),
                ),
            )
        }
