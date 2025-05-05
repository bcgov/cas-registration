import json
from typing import Any
import jsonschema
from reporting.models.report_version import ReportVersion
from reporting.models.source_type import SourceType
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from service.form_builder_service import FormBuilderService


def enable_jsonschema_draft_2020_validation(schema: Any) -> None:
    """
    RJSF uses draft-07 and doesn't support the `unevaluatedProperties` keyword.
    This method replaces the `dependencies` keyword with `dependentSchemas` and adds
    `unevaluatedProperties: False` to the schema where appropriate, to enable
    validation with draft-2020-12.
    """

    if isinstance(schema, list):
        for item in schema:
            enable_jsonschema_draft_2020_validation(item)

    if isinstance(schema, dict):
        for key in schema:
            enable_jsonschema_draft_2020_validation(schema[key])

        if "properties" in schema and schema.get("type") == "object":
            schema["unevaluatedProperties"] = False

        if "dependencies" in schema:
            schema["dependentSchemas"] = schema.pop("dependencies")


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors = {}

    for facility_report in report_version.facility_reports.all():
        for report_raw_activity in facility_report.reportrawactivitydata_records.all():
            data = report_raw_activity.json_data

            source_type_json_keys = [source_type for source_type in data["sourceTypes"]]
            source_type_ids = list(
                SourceType.objects.filter(json_key__in=source_type_json_keys).values_list("id", flat=True)
            )

            activity_schema = json.loads(
                FormBuilderService.build_form_schema(
                    report_raw_activity.activity_id,
                    report_version.id,
                    source_type_ids,
                    str(facility_report.facility_id),
                )
            )["schema"]

            enable_jsonschema_draft_2020_validation(activity_schema)

            validator = jsonschema.Draft202012Validator(activity_schema)

            try:
                validator.validate(data)
            except jsonschema.ValidationError as e:
                errors[
                    f"facility_{facility_report.facility_id}_{report_raw_activity.activity.slug}"
                ] = ReportValidationError(
                    severity=Severity.ERROR,
                    message=f"Validation error: {e.message} at: {' > '.join(str(elt) for elt in e.path)}",
                )

    return errors
