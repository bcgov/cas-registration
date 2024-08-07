from django.db import models
from registration.models.reporting_activity import ReportingActivity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_data_base_model import ReportDataBaseModel


class ReportActivity(ReportDataBaseModel):

    activity_base_schema = models.ForeignKey(
        ActivityJsonSchema,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The activity base schema used to render the form that collected this data",
    )
    activity = models.ForeignKey(
        ReportingActivity,
        on_delete=models.PROTECT,
        related_name='%(class)s_records',
        db_comment="The reporting activity this data applies to",
    )

    class Meta:
        db_table_comment = "A table to store the reported activity-specific data, in a JSON format"
        db_table = 'erc"."report_activity'
        app_label = 'reporting'
