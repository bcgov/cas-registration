from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.activity import Rls as ActivityRls
from registration.enums.enums import RegistrationTableNames


class Activity(BaseModel):
    class Applicability(models.TextChoices):
        SFO = "sfo"
        LFO = "lfo"
        ALL = "all"

    name = models.CharField(
        max_length=1000,
        db_comment="The name of an activity. The activity names come from Schedule A of the British Columbia Greenhouse Gas Emission Reporting Regulation https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleA",
    )
    applicable_to = models.CharField(
        max_length=1000,
        choices=Applicability.choices,
        db_comment="Which type of facility the activity applies to. An activity can be valid for only a Single Facility Operation, only a Linear Facilities Operation or it can apply to both",
    )
    slug = models.CharField(
        max_length=50,
        db_comment="A varchar slug to identify the activity on the frontend. This will be used to generate the routes to navigate to each activity",
    )
    weight = models.FloatField(
        db_comment='A weighted float value used to order activities. This will be used on the frontend to determine the order in which activity pages appear in an emissions report'
    )
    history = HistoricalRecords(
        table_name='erc_history"."activity_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing activity definitions for reporting. If facilities carry out these activities, in many cases they are required to report. Some activities can only be carried out by certain types of facilities. Reporting activities are listed in column 2 of Table 1 of Schedule A of the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.ACTIVITY.value}'

    Rls = ActivityRls

    def __str__(self) -> str:
        return f"{self.name} ({self.applicable_to})"
