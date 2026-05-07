from django.db import transaction

from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_version import ReportVersion


@transaction.atomic()
def prepare_activity_data_for_submission(
    report_version: ReportVersion,
) -> None:
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    for facility_report in facility_reports:
        create_report_activities_for_facility_report(facility_report)


def create_report_activities_for_facility_report(
    facility_report: FacilityReport,
) -> None:
    activities = facility_report.report_version.report_operation.activities.all()

    if not activities.exists():
        raise RuntimeError(
            "No activities found for " f"report_operation={facility_report.report_version.report_operation.id}"
        )

    for activity in activities:
        activity_base_schema = get_default_activity_base_schema(activity)

        ReportActivity.objects.get_or_create(
            report_version=facility_report.report_version,
            facility_report=facility_report,
            activity=activity,
            defaults={
                "activity_base_schema": activity_base_schema,
                "json_data": build_minimal_json_data(activity_base_schema.json_schema),
            },
        )


def get_default_activity_base_schema(
    activity: Activity,
) -> ActivityJsonSchema:
    activity_base_schema = ActivityJsonSchema.objects.filter(
        activity=activity,
    ).first()

    if activity_base_schema is None:
        raise RuntimeError(f"No ActivityJsonSchema found for activity={activity.id}")

    return activity_base_schema


def build_minimal_json_data(json_schema: dict) -> dict:
    properties = json_schema.get("properties", {})
    data = {}

    for key, value in properties.items():
        field_type = value.get("type")

        if field_type == "object":
            data[key] = build_minimal_json_data(value)
        elif field_type == "array":
            data[key] = []
        elif field_type == "boolean":
            data[key] = False
        elif field_type in ["number", "integer"]:
            data[key] = 0
        else:
            data[key] = ""

    return data
