from enum import Enum


class Severity(Enum):
    WARNING = "Warning"
    ERROR = "Error"


class ReportValidationError:
    """
    Data type for validation error

    - severity: whether the validation passed
    - message: dictionary
    """

    severity: Severity
    message: str

    def __init__(self, severity: Severity, message: str):
        self.severity = severity
        self.message = message
