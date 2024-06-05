from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


class ReportingActivity(BaseModel):
    """Reporting activity model"""

    class Applicability(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"
        ALL = "all"

    name = models.CharField(max_length=1000, db_comment="The name of a reporting activity")
    applicable_to = models.CharField(
        max_length=1000, choices=Applicability.choices, db_comment="Which type of facility the activity applies to"
    )
    history = HistoricalRecords(
        table_name='erc_history"."reporting_activity_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing names activities. If facilities carry out these activities, in many cases they are required to report. Some activities can only be carried out by certain types of facilities. Reporting activities are listed in column 2 of Table 1 of Schedule A of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015."
        db_table = 'erc"."reporting_activity'

    def __str__(self) -> str:
        return f"{self.name} ({self.applicable_to})"
