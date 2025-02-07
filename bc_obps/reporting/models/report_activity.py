from django.db import models
from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.report_data_base_model import ReportDataBaseModel
from reporting.models.triggers import immutable_report_version_trigger


class ReportActivity(ReportDataBaseModel):
    facility_report = models.ForeignKey(
        FacilityReport,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The facility report this activity data belongs to",
    )

    activity_base_schema = models.ForeignKey(
        ActivityJsonSchema,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The activity base schema used to render the form that collected this data",
    )
    activity = models.ForeignKey(
        Activity,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The reporting activity this data applies to",
    )

    class Meta(ReportDataBaseModel.Meta):
        db_table_comment = "A table to store the reported activity-specific data, in a JSON format"
        db_table = 'erc"."report_activity'
        app_label = "reporting"
        constraints = [
            models.UniqueConstraint(
                fields=["report_version", "facility_report_id", "activity_id"],
                name="unique_activity_report_per_report_and_facility_and_activity,",
            ),
        ]
        triggers = [
            *ReportDataBaseModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
