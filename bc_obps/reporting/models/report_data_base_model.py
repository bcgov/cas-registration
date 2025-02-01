from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion


class ReportDataBaseModel(TimeStampedModel):
    """
    Abstract base class for all report data models.
    Includes a json_data jsonb field and a foreign key to a report version.
    """

    json_data = models.JSONField(
        blank=True,
        db_comment="A flat JSON object representing the data collected for this model",
    )
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name='%(class)s_records',
        db_comment="The report version this data belongs to",
    )

    class Meta(TimeStampedModel.Meta):
        abstract = True
