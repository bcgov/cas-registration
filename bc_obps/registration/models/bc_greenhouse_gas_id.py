from common.enums import Schemas
from django.core.validators import RegexValidator
from registration.enums.enums import RegistrationTableNames
from registration.models.user import User
import typing
from common.models import BaseModel
from django.db import models
from registration.constants import BCGHG_ID_REGEX
from simple_history.models import HistoricalRecords
from django.utils import timezone
from registration.models.rls_configs.bc_greenhouse_gas_id import Rls as BcGreenhouseGasIdRls


class BcGreenhouseGasId(BaseModel):

    id = models.CharField(
        primary_key=True,
        max_length=255,
        db_comment="The BCGHG ID of an operation or facility",
        validators=[
            RegexValidator(regex=BCGHG_ID_REGEX, message="BCGHG ID should be 11 digits, starting with 1 or 2.")
        ],
    )
    issued_at = models.DateTimeField(
        auto_now_add=True,
        db_comment="The time the BCGHG ID was issued by an IRC user",
    )
    issued_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        db_comment="The IRC user who issued the BCGHG ID",
        blank=True,
        null=True,
        related_name="bc_greenhouse_gas_id_issued_by",
    )
    comments = models.TextField(
        blank=True,
        db_comment="Comments from admins in the case that a BCGHG ID is revoked",
    )
    history = HistoricalRecords(
        table_name='erc_history"."bc_greenhouse_gas_id_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table to store BCGHG ID metadata. Once an operation or facility meets the criteria for an ID, then it is issued one."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.BC_GREENHOUSE_GAS_ID.value}'

    Rls = BcGreenhouseGasIdRls

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to set the issued_at field if it is not already set.
        """
        if not self.issued_at:
            self.issued_at = timezone.now()
        super().save(*args, **kwargs)
