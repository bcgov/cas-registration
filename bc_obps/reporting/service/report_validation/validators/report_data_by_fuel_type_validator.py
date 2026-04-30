from reporting.models import (
    ReportFuel,
    ReportMethodology,
    ReportVersion,
    ExpectedValueRangeFuelAmount,
    ExpectedValueRangeMethodologyField,
)
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
    ReportValidationErrorKey,
    ErrorContext,
)

from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION]


def validate_fuel_amount(
    fuel_record: ReportFuel, activity_name: str, source_type_name: str, fuel_type_name: str
) -> dict[str, ReportValidationError]:
    fuel_amount = fuel_record.json_data['annualFuelAmount']
    validation_record = ExpectedValueRangeFuelAmount.objects.get(fuel_type=fuel_record.fuel_type)
    fuel_amount_errors: dict[str, ReportValidationError] = {}
    # Validate annualFuelAmount value against lower/upper bounds of expected value
    if fuel_amount < validation_record.lower_bound or fuel_amount > validation_record.upper_bound:
        fuel_amount_errors[f"report_fuel_fuel_amount_value_outside_expected_bounds_{fuel_record.id}"] = (
            ReportValidationError(
                Severity.WARNING,
                f"Fuel Amount value ({fuel_record.json_data['annualFuelAmount']}) is outside of the expected range ({validation_record.lower_bound} - {validation_record.upper_bound}) for Activity: {activity_name}, Source Type: {source_type_name}, Fuel Type: {fuel_type_name}",
                key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE,
                context=ErrorContext(
                    report_version_id=fuel_record.report_version.id,
                    facility_id=fuel_record.report_source_type.report_activity.facility_report.facility_id,
                    facility_name=fuel_record.report_source_type.report_activity.facility_report.facility_name,
                    activity_id=fuel_record.report_source_type.report_activity.activity.id,
                    activity_name=activity_name,
                    source_type_id=fuel_record.report_source_type.source_type_id,
                    source_type_name=source_type_name,
                    fuel_type_name=fuel_type_name,
                ),
            )
        )
    return fuel_amount_errors


def validate_methodology_reporting_fields(
    fuel_record: ReportFuel,
    methodology_record: ReportMethodology,
    activity_name: str,
    source_type_name: str,
    fuel_type_name: str,
) -> dict[str, ReportValidationError]:
    methodology_field_errors: dict[str, ReportValidationError] = {}
    for k, v in methodology_record.json_data.items():
        # Determine if validation ranges exist for each json key in the report_methodology json_data
        if ExpectedValueRangeMethodologyField.objects.filter(
            fuel_type=fuel_record.fuel_type, methodology=methodology_record.methodology, reporting_field__slug=k
        ).exists():
            methodology_field_validation = ExpectedValueRangeMethodologyField.objects.get(
                fuel_type=fuel_record.fuel_type, methodology=methodology_record.methodology, reporting_field__slug=k
            )
            # Validate report_methodology json_data <key> value against upper/lower bounds of expected value
            if v < methodology_field_validation.lower_bound or v > methodology_field_validation.upper_bound:
                gas_type_name = methodology_record.report_emission.gas_type.chemical_formula
                reporting_field_display_name = methodology_field_validation.reporting_field.field_display_title
                methodology_field_errors[
                    f"report_methodology_{k}_value_outside_expected_bounds_{methodology_record.id}"
                ] = ReportValidationError(
                    Severity.WARNING,
                    f"Methodology Field ({reporting_field_display_name}) with value ({v}) is outside of the expected range ({methodology_field_validation.lower_bound} - {methodology_field_validation.upper_bound}) for Activity: {activity_name}, Source Type: {source_type_name}, Fuel Type: {fuel_type_name}, Gas Type: {gas_type_name}",
                    key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD,
                    context=ErrorContext(
                        report_version_id=methodology_record.report_version.id,
                        facility_id=fuel_record.report_source_type.report_activity.facility_report.facility_id,
                        facility_name=fuel_record.report_source_type.report_activity.facility_report.facility_name,
                        activity_id=fuel_record.report_source_type.report_activity.activity.id,
                        activity_name=activity_name,
                        source_type_id=fuel_record.report_source_type.source_type_id,
                        source_type_name=source_type_name,
                        fuel_type_name=fuel_type_name,
                        gas_type_name=gas_type_name,
                        methodology_name=methodology_record.methodology.name,
                        reporting_field=reporting_field_display_name,
                    ),
                )
    return methodology_field_errors


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors: dict[str, ReportValidationError] = {}

    report_fuel_records = ReportFuel.objects.filter(report_version=report_version)

    for fr in report_fuel_records:
        if ExpectedValueRangeFuelAmount.objects.filter(fuel_type=fr.fuel_type).exists():
            activity_name = fr.report_source_type.report_activity.activity.name
            source_type_name = fr.report_source_type.source_type.name
            fuel_type_name = fr.fuel_type.name

            errors.update(
                validate_fuel_amount(
                    fuel_record=fr,
                    activity_name=activity_name,
                    source_type_name=source_type_name,
                    fuel_type_name=fuel_type_name,
                )
            )

            for mr in ReportMethodology.objects.filter(report_emission__report_fuel_id=fr.id):
                errors.update(
                    validate_methodology_reporting_fields(
                        fuel_record=fr,
                        methodology_record=mr,
                        activity_name=activity_name,
                        source_type_name=source_type_name,
                        fuel_type_name=fuel_type_name,
                    )
                )

    return errors
