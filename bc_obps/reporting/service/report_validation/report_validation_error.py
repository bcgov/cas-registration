from dataclasses import dataclass
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


class ReportValidationErrorKey(Enum):
    MISSING_REPORT_VERIFICATION = "missing_report_verification"
    VERIFICATION_STATEMENT = "verification_statement"
    OPERATION_BORO_ID = "operation_boro_id"
    ATTACHMENT_NOT_SCANNED = "attachment_not_scanned"
    ALLOCATION_MISMATCH = "allocation_mismatch"
    MISSING_REQUIRED_ATTACHMENT_CONFIRMATION = "missing_required_attachment_confirmation"
    MISSING_EXISTING_ATTACHMENT_CONFIRMATION = "missing_existing_attachment_confirmation"
    MISSING_SUPPLEMENTARY_REPORT_ATTACHMENT_CONFIRMATION = "missing_supplementary_report_attachment_confirmation"
    MISSING_SUPPLEMENTARY_REPORT_VERSION_CHANGE = "missing_supplementary_report_version_change"


class ErrorContext(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    report_version_id: int
    facility_id: Optional[UUID] = None
    facility_name: Optional[str] = None
    emission_category_id: Optional[int] = None
    emission_category_name: Optional[str] = None
    activity_id: Optional[int] = None


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
