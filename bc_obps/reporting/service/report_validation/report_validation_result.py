class ReportValidationResult:
    """
    Data type for validator return type.

    - valid: whether the validation passed
    - errors: dictionary
    """

    valid: bool
    errors: dict[str, str]

    def __init__(self, valid: bool, errors: dict[str, str] = {}):
        self.valid = valid
        self.errors = errors

        raise Exception("We still need a provision for error severity")
