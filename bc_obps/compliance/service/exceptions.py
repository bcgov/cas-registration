class ComplianceInvoiceError(Exception):
    """
    Raise this whenever any required “piece” of the invoice context is missing
    or cannot be computed.  The `error_key` will be used as the dict key
    in the final {"errors": { error_key: message }} response.
    """

    def __init__(self, error_key: str, message: str):
        self.error_key = error_key
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        # When printed or logged, show "<error_key>: <message>"
        return f"{self.error_key}: {self.message}"
