from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import TimeStampedModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.well_authorization_number import Rls as WellAuthorizationNumberRls


class WellAuthorizationNumber(TimeStampedModel):
    well_authorization_number = models.IntegerField(
        primary_key=True, db_comment="A well authorization number from the BC Energy Regulator"
    )

    history = HistoricalRecords(
        table_name='erc_history"."well_authorization_number_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table containing well authorization numbers. Authorization numbers are assigned by the British Columbia Energy Regulator: https://www.bc-er.ca/what-we-regulate/oil-gas/wells/. Facilities can have multiple well authorization numbers."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.WELL_AUTHORIZATION_NUMBER.value}'

    Rls = WellAuthorizationNumberRls
