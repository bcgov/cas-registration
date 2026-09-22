from registration.models.time_stamped_model import TimeStampedModel
from common.enums import Schemas
from django.db import models
from registry.enums.enums import RegistryTableNames
from registry.models import SubAccount
from registry.models.rls_configs.unit import Rls as UnitRls


class Unit(TimeStampedModel):
    class UnitTypes(models.TextChoices):
        EARNED_CREDIT = "Earned Credit"
        OFFSET = "Carbon Offset"

    class Status(models.TextChoices):
        ISSUED = "Issued"
        ACTIVE = "Active"
        RETIRED = "Retired"
        CANCELLED = "Cancelled"
        PENDING = "Pending"

    id = models.UUIDField(primary_key=True)
    unit_type = models.CharField(
        max_length=50,
        choices=UnitTypes.choices,
        db_comment="Indicates whether the type of unit is an Earned Credit or a Carbon Offset.",
    )
    serial_number = models.CharField(max_length=200, db_comment="The serial number of the unit as set by BCCR")
    is_public = models.BooleanField(
        default=True,
        db_comment="Boolean value indicating whether the status and owning account of the unit should be visible to the public from the public-view of the registry",
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        db_comment="Indicates whether the unit is active, retired, pending, cancelled, or issued.",
    )
    sub_account = models.ForeignKey(
        SubAccount,
        related_name="units",
        on_delete=models.DO_NOTHING,
        db_comment="Foreign key reference to the sub-account that currently holds the unit/s",
    )
    vintage = models.CharField(max_length=10)

    class Meta(TimeStampedModel.Meta):
        db_table_comment = ""
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.UNIT.value}'

    Rls = UnitRls
