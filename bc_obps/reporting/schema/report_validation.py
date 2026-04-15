from ninja import Schema


class ErrorContextSchema(Schema):
    report_version_id: int
    missing_fields: list[str] | None = None


class ReportValidationErrorDetailSchema(Schema):
    severity: str
    message: str
    context: ErrorContextSchema | None = None


class ReportValidationItemSchema(Schema):
    key: str
    error: ReportValidationErrorDetailSchema


class ReportValidationPayloadSchema(Schema):
    errors: list[ReportValidationItemSchema]
