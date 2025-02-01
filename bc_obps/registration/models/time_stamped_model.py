from typing import Optional
from uuid import UUID
from common.models import BaseModel
from django.db import models
from django.utils import timezone
import pgtrigger


class TimeStampedModelManager(models.Manager):
    def get_queryset(self) -> models.QuerySet:
        """Return only objects that have not been archived"""
        return super().get_queryset().filter(archived_at__isnull=True)


class TimeStampedModel(BaseModel):
    created_by = models.ForeignKey(
        'registration.User',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='%(class)s_created',
    )
    created_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(
        'registration.User',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='%(class)s_updated',
    )
    updated_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        'registration.User',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='%(class)s_archived',
    )
    archived_at = models.DateTimeField(null=True, blank=True)
    objects = TimeStampedModelManager()

    class Meta:
        abstract = True
        triggers = [
            # On Create
            pgtrigger.Trigger(
                name="set_created_audit_columns",
                when=pgtrigger.Before,
                operation=pgtrigger.Insert,
                func="new.created_by_id = (select current_setting('my.guid')); new.created_at = now(); return new;",
            ),
            # On Update
            pgtrigger.Trigger(
                name="set_updated_audit_columns",
                when=pgtrigger.Before,
                operation=pgtrigger.Update,
                func="new.updated_by_id = (select current_setting('my.guid')); new.updated_at = now(); return new;",
            ),
        ]

    def set_archive(self, modifier_pk: UUID) -> None:
        """Set the archived by field and archived at field if they are not already set."""
        if self.archived_by_id or self.archived_at:
            raise ValueError("Archived by or archived at is already set.")
        self.__class__.objects.filter(pk=self.pk).update(archived_by_id=modifier_pk, archived_at=timezone.now())

    @property
    def _history_user(self) -> Optional['models.User']:  # type: ignore[name-defined]
        return self.archived_by or self.updated_by or self.created_by
