from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import F
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:

    report_fuels_missing_amounts = ReportFuel.objects.filter(
        report_version=report_version, json_data__annual_fuel_amount__isnull=True
    )

    if report_fuels_missing_amounts.exists():

        grouped_activities = report_fuels_missing_amounts.values(
            facility_name=F("report_source_type__report_activity__facility_report__facility_name")
        ).annotate(activities=ArrayAgg("report_source_type__report_activity__activity__name", distinct=True))

        details = [
            f"\n{activity_data['facility_name']}:\n{"\n".join(["    - " + activity for activity in activity_data['activities']])}"
            for activity_data in grouped_activities
        ]

        return {
            "report_fuel_missing_amount": ReportValidationError(
                Severity.ERROR,
                f"Fuel amount values are missing for the following facilities and activities:\n{"".join(details)}",
                key=ReportValidationErrorKey.REPORT_FUEL_MISSING_AMOUNT,
            )
        }

    return {}
