from django.db import models
from registration.models import Address, BusinessRole, Document, UserAndContactCommonInfo, TimeStampedModel
from simple_history.models import HistoricalRecords


class Contact(UserAndContactCommonInfo, TimeStampedModel):
    """Contact model"""

    documents = models.ManyToManyField(
        Document,
        blank=True,
        related_name="contacts",
    )
    business_role = models.ForeignKey(
        BusinessRole,
        on_delete=models.DO_NOTHING,
        related_name="contacts",
        db_comment="The role assigned to this contact which defines the permissions the contact has.",
    )
    address = models.ForeignKey(
        Address,
        blank=True,
        null=True,
        on_delete=models.DO_NOTHING,
        db_comment="Foreign key to the address of a user or contact",
        related_name="contacts",
    )

    history = HistoricalRecords(
        table_name='erc_history"."contact_history',
        m2m_fields=[documents],
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing information about contacts. Contacts are people that IRC may need to get in touch with to confirmation information about industry. Contacts can be BCIERs app users (in which case they will also have a record in the Users table), but they don't have to be."
        db_table = 'erc"."contact'
        indexes = [
            models.Index(fields=["business_role"], name="contact_role_idx"),
        ]

    # def __str__(self) -> str:
    #     fields = [f"{field.name}={getattr(self, field.name)}" for field in self._meta.fields]
    #     return ' - '.join(fields)
