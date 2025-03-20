from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import uuid
from registration.models.time_stamped_model import TimeStampedModel
from .rls_configs.elicensing_link import Rls as ELicensingLinkRls


class ELicensingLink(TimeStampedModel):
    """
    Model to store links between system objects and various eLicensing objects.

    This model maintains the relationship between objects in our system
    (operators, reports, applications, etc.) and objects in the eLicensing system
    (clients, invoices, fees, etc.), allowing for future queries and additional metadata storage.
    """

    id = models.AutoField(primary_key=True, db_comment="Standard Django primary key")

    elicensing_guid = models.UUIDField(
        default=uuid.uuid4, editable=False, db_comment="Unique identifier for the eLicensing system integration"
    )

    class ObjectKind(models.TextChoices):
        CLIENT = 'Client', 'Client'
        INVOICE = 'Invoice', 'Invoice'
        FEE = 'Fee', 'Fee'
        PAYMENT = 'Payment', 'Payment'

    # Generic Foreign Key to allow linking to any model
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
        related_name="+",
        db_comment="The type of CAS object this link relates to",
    )
    object_id = models.UUIDField(
        db_comment="The ID of the CAS object this link relates to",
    )
    content_object = GenericForeignKey('content_type', 'object_id')

    elicensing_object_kind = models.CharField(
        max_length=20,
        choices=ObjectKind.choices,
        default=ObjectKind.CLIENT,
        db_comment="The type of eLicensing object (client, invoice, fee, etc.)",
    )

    elicensing_object_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        db_comment="The object ID in the eLicensing system",
    )

    last_sync_at = models.DateTimeField(
        null=True,
        blank=True,
        db_comment="The timestamp when this object was last synced with eLicensing",
    )

    sync_status = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_comment="Status of the last sync operation with eLicensing",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store links between system objects and eLicensing objects"
        db_table = 'erc"."elicensing_link'
        unique_together = ('content_type', 'object_id', 'elicensing_object_kind')
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['elicensing_object_kind']),
            models.Index(fields=['elicensing_object_id']),
            models.Index(fields=['elicensing_guid']),
        ]

    Rls = ELicensingLinkRls
