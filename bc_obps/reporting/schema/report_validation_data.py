from uuid import UUID
from ninja import Schema


class ErrorContextSchema(Schema):
    report_version_id: int
    facility_id: UUID | None = None
    facility_name: str | None = None
    emission_category_id: int | None = None
    emission_category_name: str | None = None
    section: str | None = None
    section_title: str | None = None
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
