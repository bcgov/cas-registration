from dataclasses import dataclass
from enum import Enum


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


@dataclass
class ReportValidationError:
    """
    Data type for validation error

    - severity: whether the validation passed
    - message: dictionary
    """

    severity: Severity
    message: str
