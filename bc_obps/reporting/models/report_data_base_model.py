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
        db_comment="A flat JSON object representing the data collected for this model from the different sections of the schema defined in the erc.activity_source_type_json_schema table. Refer to the Greenhouse Gas Emission Reporting Regulation(https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#section14) Schedule A, Tables 1&2 for the emission's relationships & reporting requirements.",
    )
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name='%(class)s_records',
        db_comment="The report version this data belongs to. Foreign key to the erc.report_version table",
    )

    class Meta(TimeStampedModel.Meta):
        abstract = True
