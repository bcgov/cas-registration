from django.db import models
from registration.models import TimeStampedModel, Facility
from simple_history.models import HistoricalRecords


class WellAuthorizationNumber(TimeStampedModel):
    well_authorization_number = models.IntegerField(
        primary_key=True, db_comment="A well authorization number from the BC Energy Regulator"
    )
    facility = models.ForeignKey(Facility, on_delete=models.DO_NOTHING, related_name="well_authorization_numbers")

    history = HistoricalRecords(
        table_name='erc_history"."well_authorization_number_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "A table containing well authorization numbers. Authorization numbers are assigned by the British Columbia Energy Regulator: https://www.bc-er.ca/what-we-regulate/oil-gas/wells/. Facilities can have multiple well authorization numbers."
        db_table = 'erc"."well_authorization_number'
