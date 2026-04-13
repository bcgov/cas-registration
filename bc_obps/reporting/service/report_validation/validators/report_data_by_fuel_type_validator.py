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


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates reported activity data to be within ranges defined by fuel type.
    This validation will validate that report_fuel records and any child report_methodology records are within expected ranges.

    This validation returns WARNING level severity errors.

    Args:
        report_version (ReportVersion): The report version to validate.

    Returns:
        dict[str, ReportValidationError]: A dictionary of validation errors
    """
    errors: dict[str, ReportValidationError] = {}

    report_fuel_records = ReportFuel.objects.filter(report_version=report_version)

    # For each report_fuel record for the report_version
    for fr in report_fuel_records:
        # Determine if validation ranges exist for the fuel type
        if ExpectedValueRangeFuelAmount.objects.filter(fuel_type=fr.fuel_type).exists():
            fuel_amount = fr.json_data['annualFuelAmount']
            validation_record = ExpectedValueRangeFuelAmount.objects.get(fuel_type=fr.fuel_type)
            activity_name = fr.report_source_type.report_activity.activity.name
            source_type_name = fr.report_source_type.source_type.name
            fuel_type_name = fr.fuel_type.name
            # Validate annualFuelAmount value against lower/upper bounds of expected value
            if fuel_amount < validation_record.lower_bound or fuel_amount > validation_record.upper_bound:
                errors[f"report_fuel_fuel_amount_value_outside_expected_bounds_{fr.id}"] = ReportValidationError(
                    Severity.WARNING,
                    f"Fuel Amount value ({fr.json_data['annualFuelAmount']}) is outside of the expected range ({validation_record.lower_bound} - {validation_record.upper_bound}) for Activity: {activity_name}, Source Type: {source_type_name}, Fuel Type: {fuel_type_name}",
                    key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE,
                    context=ErrorContext(
                        report_version_id=report_version.id,
                        facility_id=fr.report_source_type.report_activity.facility_report.facility_id,
                        facility_name=fr.report_source_type.report_activity.facility_report.facility_name,
                        activity_id=fr.report_source_type.report_activity.activity.id,
                        activity_name=activity_name,
                        source_type_id=fr.report_source_type.source_type_id,
                        source_type_name=source_type_name,
                        fuel_type_name=fuel_type_name,
                    ),
                )
            # For each report_methodology record related to the report_fuel record
            for mr in ReportMethodology.objects.filter(report_emission__report_fuel_id=fr.id):
                for k, v in mr.json_data.items():
                    # Determine if validation ranges exist for each json key in the report_methodology json_data
                    if ExpectedValueRangeMethodologyField.objects.filter(
                        fuel_type=fr.fuel_type, methodology=mr.methodology, reporting_field__slug=k
                    ).exists():
                        methodology_field_validation = ExpectedValueRangeMethodologyField.objects.get(
                            fuel_type=fr.fuel_type, methodology=mr.methodology, reporting_field__slug=k
                        )
                        # Validate report_methodology json_data <key> value against upper/lower bounds of expected value
                        if v < methodology_field_validation.lower_bound or v > methodology_field_validation.upper_bound:
                            gas_type_name = mr.report_emission.gas_type.chemical_formula
                            reporting_field_display_name = (
                                methodology_field_validation.reporting_field.field_display_title
                            )
                            errors[f"report_methodology_{k}_value_outside_expected_bounds_{mr.id}"] = (
                                ReportValidationError(
                                    Severity.WARNING,
                                    f"Methodology Field ({reporting_field_display_name}) with value ({v}) is outside of the expected range ({methodology_field_validation.lower_bound} - {methodology_field_validation.upper_bound}) for Activity: {activity_name}, Source Type: {source_type_name}, Fuel Type: {fuel_type_name}, Gas Type: {gas_type_name}",
                                    key=ReportValidationErrorKey.REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD,
                                    context=ErrorContext(
                                        report_version_id=report_version.id,
                                        facility_id=fr.report_source_type.report_activity.facility_report.facility_id,
                                        facility_name=fr.report_source_type.report_activity.facility_report.facility_name,
                                        activity_id=fr.report_source_type.report_activity.activity.id,
                                        activity_name=activity_name,
                                        source_type_id=fr.report_source_type.source_type_id,
                                        source_type_name=source_type_name,
                                        fuel_type_name=fuel_type_name,
                                        gas_type_name=gas_type_name,
                                        methodology_name=mr.methodology.name,
                                        reporting_field=reporting_field_display_name,
                                    ),
                                )
                            )
    return errors
