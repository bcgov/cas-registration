from uuid import UUID

from ninja import Schema


class ErrorContextSchema(Schema):
    report_version_id: int
    facility_id: UUID | None = None
    facility_name: str | None = None
    activity_id: int | None = None
    activity_name: str | None = None
    source_type_id: int | None = None
    source_type_name: str | None = None
    fuel_type_name: str | None = None
    gas_type_name: str | None = None
    methodology_name: str | None = None
    reporting_field: str | None = None
    emission_category_id: int | None = None
    emission_category_name: str | None = None
    section: str | None = None
    section_title: str | None = None
    missing_fields: list[str] | None = None
    expected_range: str | None = None
    user_input: str | None = None


class ValidationErrorDetailSchema(Schema):
    severity: str
    message: str
    context: ErrorContextSchema | None = None


class ValidationErrorSchema(Schema):
    key: str
    error: ValidationErrorDetailSchema


class ValidationErrorsResponseSchema(Schema):
    errors: list[ValidationErrorSchema]
