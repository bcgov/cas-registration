from dataclasses import dataclass
from enum import Enum, StrEnum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


class ReportValidationErrorKey(StrEnum):
    MISSING_REPORT_VERIFICATION = "missing_report_verification"
    VERIFICATION_STATEMENT = "verification_statement"
    OPERATION_BORO_ID = "operation_boro_id"
    ATTACHMENT_NOT_SCANNED = "attachment_not_scanned"
    ALLOCATION_MISMATCH = "allocation_mismatch"
    MISSING_SUPPLEMENTARY_REPORT_REQUIRED_ATTACHMENT_CONFIRMATION = (
        "missing_supplementary_report_required_attachment_confirmation"
    )
    MISSING_SUPPLEMENTARY_REPORT_EXISTING_ATTACHMENT_CONFIRMATION = (
        "missing_supplementary_report_existing_attachment_confirmation"
    )
    MISSING_SUPPLEMENTARY_REPORT_ATTACHMENTS_CONFIRMATION = "missing_supplementary_report_attachments_confirmation"
    MISSING_SUPPLEMENTARY_REPORT_VERSION_CHANGE = "missing_supplementary_report_version_change"
    REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE = "report_data_out_of_bounds_by_fuel_type"
    REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD = "report_data_out_of_bounds_by_reporting_field"
    ACTIVITY_DATA_COVERAGE = "activity_data_coverage"
    ERROR_REQUIRED_FIELDS = "error_required_fields"
    ACTIVITY_JSON_SCHEMA_VALIDATION_ERROR = "activity_json_schema_validation_error"


class ErrorContext(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )

    report_version_id: int
    facility_id: Optional[UUID] = None
    facility_name: Optional[str] = None
    emission_category_id: Optional[int] = None
    emission_category_name: Optional[str] = None
    activity_id: Optional[int] = None
    activity_name: Optional[str] = None
    source_type_id: Optional[int] = None
    source_type_name: Optional[str] = None
    fuel_type_name: Optional[str] = None
    gas_type_name: Optional[str] = None
    methodology_name: Optional[str] = None
    reporting_field: Optional[str] = None
    section: Optional[str] = None
    section_title: Optional[str] = None
    missing_fields: list[str] | None = None


@dataclass
class ReportValidationError:
    """
    Data type for validation error details

    - severity: what kind of error it is (e.g. warning vs error)
    - message: human-readable explanation for the validation error
    - key: an identifier for the type of validation error, used for frontend handling
    - context: optional data related to the report where the error occurred
    """

    severity: Severity
    message: str
    key: ReportValidationErrorKey
    context: Optional[ErrorContext] = None
