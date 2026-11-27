from dataclasses import dataclass
from enum import Enum, StrEnum
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
    OG_NP_NC_ALLOCATION_MISMATCH = "og_np_nc_allocation_mismatch"
    MISSING_SUPPLEMENTARY_REPORT_REQUIRED_ATTACHMENT_CONFIRMATION = (
        "missing_supplementary_report_required_attachment_confirmation"
    )
    MISSING_SUPPLEMENTARY_REPORT_EXISTING_ATTACHMENT_CONFIRMATION = (
        "missing_supplementary_report_existing_attachment_confirmation"
    )
    MISSING_SUPPLEMENTARY_REPORT_ATTACHMENTS_CONFIRMATION = (
        "missing_supplementary_report_attachments_confirmation"
    )
    MISSING_SUPPLEMENTARY_REPORT_VERSION_CHANGE = (
        "missing_supplementary_report_version_change"
    )
    REPORT_DATA_OUT_OF_BOUNDS_BY_FUEL_TYPE = "report_data_out_of_bounds_by_fuel_type"
    REPORT_DATA_OUT_OF_BOUNDS_BY_REPORTING_FIELD = (
        "report_data_out_of_bounds_by_reporting_field"
    )
    ERROR_REQUIRED_FIELDS = "error_required_fields"
    REPORT_ACTIVITY_JSON_VALIDATION = "report_activity_json_validation"
    REPORT_FUEL_MISSING_AMOUNT = "report_fuel_missing_amount"
    MISSING_REGULATED_PRODUCT = "missing_regulated_product"


class ErrorContext(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
    )

    report_version_id: int
    facility_id: UUID | None = None
    facility_name: str | None = None
    emission_category_id: int | None = None
    emission_category_name: str | None = None
    activity_id: int | None = None
    activity_name: str | None = None
    source_type_id: int | None = None
    source_type_name: str | None = None
    fuel_type_name: str | None = None
    gas_type_name: str | None = None
    methodology_name: str | None = None
    reporting_field: str | None = None
    section: str | None = None
    section_title: str | None = None
    missing_fields: list[str] | None = None
    expected_range: str | None = None
    user_input: str | None = None


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
    context: ErrorContext | None = None
