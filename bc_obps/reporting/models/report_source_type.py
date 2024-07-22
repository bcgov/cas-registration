from django.db import models
from reporting.models import ActivitySourceTypeJsonSchema, ReportDataBaseModel
from reporting.models.report_activity import ReportActivity
from reporting.models.source_type import SourceType


class ReportSourceType(ReportDataBaseModel):

    activity_source_type_base_schema = models.ForeignKey(
        ActivitySourceTypeJsonSchema,
        on_delete=models.DO_NOTHING,
        db_comment="The activity-source-type base schema used to render the form that collected this data",
    )
    report_activity = models.ForeignKey(
        ReportActivity,
        on_delete=models.CASCADE,
        db_comment="The activity data record this source type data belongs to",
    )
    source_type = models.ForeignKey(
        SourceType, on_delete=models.DO_NOTHING, db_comment="The source type this data applies to"
    )

    class Meta:
        db_table_comment = "A table to store the reported activity-specific data, in a JSON format"
        db_table = 'erc"."report_source_type'
        app_label = 'reporting'
