# Example:
# from . import example_validator

from . import (
    mandatory_verification_statement,
    operation_boroid_presence,
    report_attachments_are_scanned,
    report_activity_json_validation,
    report_data_by_fuel_type_validator,
    report_emission_allocation_validator,
    supplementary_report_attachments_confirmation,
    supplementary_report_version_change,
    required_fields_report_operation,
    required_fields_report_person_responsible,
)


__all__ = [
    # Example:
    # "example_validator",
    "required_fields_report_operation",
    "required_fields_report_person_responsible",
    "operation_boroid_presence",
    "mandatory_verification_statement",
    "report_attachments_are_scanned",
    "supplementary_report_version_change",
    "supplementary_report_attachments_confirmation",
    "report_activity_json_validation",
    "report_emission_allocation_validator",
    "report_data_by_fuel_type_validator",
]


__section_validators__ = {
    # add report validations sections...
    "report_operation": ["required_fields_report_operation"],
    "person-responsible": ["required_fields_report_person_responsible"],
    "allocation_of_emissions": ["report_emission_allocation_validator"],
}
