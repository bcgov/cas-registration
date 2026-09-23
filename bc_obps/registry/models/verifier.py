from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from simple_history.models import HistoricalRecords
from registry.enums.enums import RegistryTableNames
from registry.models.rls_configs.verifier import Rls as VerifierRls


class Verifier(TimeStampedModel):
    id = models.UUIDField(primary_key=True)
    name = models.CharField(max_length=500, db_comment="The business name of the verifier")

    history = HistoricalRecords(
        table_name='erc_history"."verifier_history', history_user_id_field=models.UUIDField(null=True, blank=True)
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing verifier information relating to the internal BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.VERIFIER.value}'

    Rls = VerifierRls
