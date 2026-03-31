from reporting.service.report_validation.report_validation_error import ReportValidationError


class ReportValidationException(Exception):
    """
    Raised when report validation fails with one or more errors.
    `errors` is a dict mapping error keys to ReportValidationError instances.
    """

    def __init__(self, errors: dict[str, ReportValidationError]):
        self.errors = errors
        super().__init__(str(errors))
