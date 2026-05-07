# ruff: noqa: F401
# Importing each validator module causes its ReportValidator subclass to be
# defined, which fires ReportValidator.__init_subclass__ and registers the
# class into VALIDATOR_REGISTRY (defined in .base). The dispatcher
# (ReportValidationService) iterates that registry directly.

from . import (
    activity_data_coverage_validator,
    mandatory_verification_statement,
    operation_boroid_presence,
    report_attachments_are_scanned,
    report_activity_json_validation,
    report_data_by_fuel_type_validator,
    report_emission_allocation_validator,
    supplementary_report_attachments_confirmation,
    supplementary_report_version_change,
)

from .required_fields import (
    required_fields_report_operation_information,
    required_fields_report_person_responsible,
    required_fields_report_activity_data,
    required_fields_report_review_facilities,
    required_fields_report_review_facility_information,
    required_fields_report_non_attributable_emissions,
    required_fields_report_production_data,
    required_fields_report_emission_allocation,
    required_fields_report_additional_data,
    required_fields_report_new_entrant_information,
    required_fields_report_electricity_import_data,
)
