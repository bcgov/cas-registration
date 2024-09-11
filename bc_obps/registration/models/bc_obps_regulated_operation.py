import re
import typing
from common.models import BaseModel
from django.db import models
from registration.constants import BORO_ID_REGEX
from simple_history.models import HistoricalRecords
from django.utils import timezone
from django.core.exceptions import ValidationError


class BcObpsRegulatedOperation(BaseModel):
    class Statuses(models.TextChoices):
        ACTIVE = "Active"
        INACTIVE = "Inactive"

    id = models.CharField(
        primary_key=True,
        max_length=255,
        db_comment="The BC OBPS regulated operation ID of an operation when operation is approved",
    )
    issued_at = models.DateTimeField(
        auto_now_add=True,
        db_comment="The time the BC OBPS Regulated Operation ID was issued by an IRC user",
    )
    comments = models.TextField(
        blank=True,
        db_comment="Comments from admins in the case that a BC OBPS Regulated Operation ID is revoked",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.ACTIVE,
        db_comment="The status of an operation.",
    )
    history = HistoricalRecords(
        table_name='erc_history"."bc_obps_regulated_operation_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table to store BC OBPS Regulated Operation metadata. Once an operation has been approved as a BC OBPS Regulated Operations (IRC has determined the operation meets certain criteria and should be included in the program), then it is issued an ID."
        db_table = 'erc"."bc_obps_regulated_operation'

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to set the issued_at field if it is not already set.
        """
        if not re.match(BORO_ID_REGEX, self.id):
            raise ValidationError("Generated BORO ID is not in the correct format.")
        if not self.issued_at:
            self.issued_at = timezone.now()
        super().save(*args, **kwargs)
