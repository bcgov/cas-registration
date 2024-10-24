import uuid
from django.db import models
from registration.models import TimeStampedModel, Document
from simple_history.models import HistoricalRecords


class NewEntrantOperationDetail(TimeStampedModel):
    class DateOfFirstShipmentChoices(models.Choices):
        BEFORE_MARCH_31_2024 = "On or before March 31, 2024"
        AFTER_APRIL_1_2024 = "On or after April 1, 2024"

    date_of_first_shipment = models.CharField(
        max_length=1000,
        choices=DateOfFirstShipmentChoices.choices,
        db_comment="The date of the operation's first shipment (determines which application and statutory declaration template should be used)",
    )
    history = HistoricalRecords(
        table_name='erc_history"."new_entrant_operation_detail_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing details about operations who have registered as new entrants"
        db_table = 'erc"."new_entrant_operation_detail'
