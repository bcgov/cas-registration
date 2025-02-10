from django.db import models
from reporting.models import ActivitySourceTypeJsonSchema, ReportDataBaseModel
from reporting.models.report_activity import ReportActivity
from reporting.models.source_type import SourceType
from reporting.models.triggers import immutable_report_version_trigger


class ReportSourceType(ReportDataBaseModel):
    activity_source_type_base_schema = models.ForeignKey(
        ActivitySourceTypeJsonSchema,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The activity-source-type base schema used to render the form that collected this data",
    )
    source_type = models.ForeignKey(
        SourceType,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The source type this data applies to",
    )
    report_activity = models.ForeignKey(
        ReportActivity,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The activity data record this source type data belongs to",
    )

    class Meta(ReportDataBaseModel.Meta):
        db_table_comment = "A table to store the reported source type-specific data, in a JSON format"
        db_table = 'erc"."report_source_type'
        app_label = "reporting"
        constraints = [
            models.UniqueConstraint(
                fields=["report_activity", "source_type"],
                name="unique_source_type_report_per_activity_report_and_source_type",
            ),
        ]
        triggers = [
            *ReportDataBaseModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
