import typing
from registration.models.time_stamped_model import TimeStampedModel
from registration.models.operation import Operation
from django.db import models
from simple_history.models import HistoricalRecords
from django.core.cache import cache


class RegistrationPurpose(TimeStampedModel):
    class Purposes(models.TextChoices):
        REPORTING_OPERATION = 'Reporting Operation'
        OBPS_REGULATED_OPERATION = 'OBPS Regulated Operation'
        OPTED_IN_OPERATION = 'Opted-in Operation'
        NEW_ENTRANT_OPERATION = 'New Entrant Operation'
        ELECTRICITY_IMPORT_OPERATION = 'Electricity Import Operation'
        POTENTIAL_REPORTING_OPERATION = 'Potential Reporting Operation'

    registration_purpose = models.CharField(
        max_length=1000,
        db_comment="Registration purpose",
        choices=Purposes.choices,
    )
    operation = models.ForeignKey(
        Operation,
        db_comment="The operator that has the purpose",
        on_delete=models.DO_NOTHING,
        related_name="registration_purposes",
    )
    history = HistoricalRecords(
        table_name='erc_history"."registration_purpose_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table that contains operations and their registration purposes."
        db_table = 'erc"."registration_purpose'

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when/if the registration purpose is saved.
        """
        cache.delete('registration_purposes')
        super().save(*args, **kwargs)
