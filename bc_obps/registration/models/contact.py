from django.db import models
from registration.models import Address, BusinessRole, UserAndContactCommonInfo, TimeStampedModel, Operator
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.contact import Rls as ContactRls
import pgtrigger


class Contact(UserAndContactCommonInfo, TimeStampedModel):
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
    operator = models.ForeignKey(
        Operator,
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        related_name="contacts",
    )

    history = HistoricalRecords(
        table_name='erc_history"."contact_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing information about contacts. Contacts are people that IRC may need to get in touch with to confirm information about industry. Contacts can be BCIERs app users (in which case they will also have a record in the Users table), but they don't have to be."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.CONTACT.value}'
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'operator'],
                name='unique_email_per_operator',
                condition=models.Q(operator__isnull=False),
            )
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            pgtrigger.Trigger(
                # Prevent setting address to NULL for Operation Representative
                name="protect_address_null_update",
                level=pgtrigger.Row,  # Row-level trigger
                when=pgtrigger.Before,  # Trigger before the update
                operation=pgtrigger.Update,  # Only for UPDATE operations
                condition=pgtrigger.Q(
                    old__address__isnull=False,  # Old address was not null
                    new__address__isnull=True,  # New address is null
                ),
                func="""
                    if new.business_role_id = 'Operation Representative'
                    then
                        raise exception 'Cannot set address to NULL for a contact with role Operation Representative';
                    end if;
                    return new;
                """,
            ),
        ]

    Rls = ContactRls
