import json
from typing import Any
import jsonschema
import jsonschema.protocols
from reporting.models.report_version import ReportVersion
from reporting.models.source_type import SourceType
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
)
from service.form_builder_service import FormBuilderService


def insert_additional_properties_keys(schema: Any) -> None:
    if isinstance(schema, list):
        for item in schema:
            insert_additional_properties_keys(item)

    if not isinstance(schema, dict):
        return

    for key in schema:
        insert_additional_properties_keys(schema[key])

    if "properties" in schema and schema.get("type") == "object":
        schema["unevaluatedProperties"] = False


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    errors = {}

    for facility_report in report_version.facility_reports.all():
        for report_raw_activity in facility_report.reportrawactivitydata_records.all():
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~")
            data = report_raw_activity.json_data

            source_type_json_keys = [source_type for source_type in data["sourceTypes"]]
            source_type_ids = list(
                SourceType.objects.filter(
                    json_key__in=source_type_json_keys
                ).values_list("id", flat=True)
            )

            # print(report_raw_activity.activity_id)
            # print(report_version.id)
            # print(source_type_ids)
            # print(facility_report.facility_id)

            activity_schema = json.loads(
                FormBuilderService.build_form_schema(
                    report_raw_activity.activity_id,
                    report_version.id,
                    source_type_ids,
                    facility_report.facility_id,
                )
            )["schema"]
            insert_additional_properties_keys(activity_schema)

            # data["sourceTypes"]["gscWithProductionOfUsefulEnergy"]["units"][0][
            #     "extraUnitProp"
            # ] = "sheep"

            # print(json.dumps(data, indent=1))
            print(json.dumps(activity_schema, indent=2))

            validator = jsonschema.Draft202012Validator(activity_schema)
            result = validator.validate(data)

            print(result)
            print("~~~~~~~~~~~~~~~~~~~~~~~~~~~")

    return errors
