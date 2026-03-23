from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


@dataclass
class ReportValidationError:
    """
    Data type for validation error

    - severity: whether the validation passed
    - message: human-readable explanation for the validation error
    - fix_url: optional frontend route where the user can resolve the error
    """

    severity: Severity
    message: str
    fix_url: Optional[str] = None
