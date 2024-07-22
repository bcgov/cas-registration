from common.models.base_model import BaseModel
from django.db import models
from reporting.models.report_version import ReportVersion


class ReportDataBaseModel(BaseModel):
    """
    Abstract base class for all report data models.
    Includes a json_data jsonb field and a foreign key to a report version.
    """

    json_data = models.JSONField(db_comment="A flat JSON object representing the data collected for this model")
    report_version_id = models.ForeignKey(
        ReportVersion, on_delete=models.CASCADE, related_name='+', db_comment="The report version this data belongs to"
    )

    class Meta:
        abstract = True
