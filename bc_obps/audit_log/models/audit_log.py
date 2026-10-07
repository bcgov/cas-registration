from django.db import models

from common.enums import Schemas


class AuditLog(models.Model):
    """
    An append-only record of a change made to an audited entity (e.g. Operation, ReportVersion).

    Each row is derived from a single django-simple-history historical record and captures
    a point-in-time snapshot of the watched fields for that entity, along with which of those
    fields changed and (optionally) why. Rows are never updated or archived once created.
    """

    class Action(models.TextChoices):
        CREATE = "create", "Create"
        UPDATE = "update", "Update"
        DELETE = "delete", "Delete"

    entity_type = models.CharField(
        max_length=100,
        db_comment="The type of entity this audit log entry is about, e.g. 'operation' or 'report_version'. Matches a key in the audit_log app's AUDITED_VIEWS registry.",
    )
    entity_id = models.CharField(
        max_length=100,
        db_comment="The primary key of the audited entity, stringified since PKs vary between UUID and int across models.",
    )
    action = models.CharField(
        max_length=10,
        choices=Action.choices,
        db_comment="Whether the change that produced this entry was a create, update, or delete of the source record.",
    )
    actor = models.ForeignKey(
        'registration.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        db_comment="The user who made the change, if known. Foreign key to erc.user. Null if the user record has since been removed or the change was system-driven.",
    )
    actor_guid = models.UUIDField(
        null=True,
        blank=True,
        db_comment="A redundant copy of the acting user's GUID, captured at write time in case the corresponding User row is later removed.",
    )
    timestamp = models.DateTimeField(
        db_comment="The date and time at which the change that produced this entry occurred.",
    )
    snapshot = models.JSONField(
        db_comment="A point-in-time snapshot of all watched fields for the entity, keyed by field name: {field_key: {'label': ..., 'value': <resolved display string>}}.",
    )
    changed_fields = models.JSONField(
        default=list,
        db_comment="The list of watched field keys that changed as part of this event. Empty for delete events.",
    )
    reason = models.TextField(
        null=True,
        blank=True,
        db_comment="A human-readable explanation of why the change was made, sourced from the triggering historical record's history_change_reason, when present.",
    )
    history_record_content_type = models.ForeignKey(
        'contenttypes.ContentType',
        on_delete=models.PROTECT,
        db_comment="The content type of the source Historical<Model> record this entry was derived from, for traceability.",
    )
    history_record_id = models.CharField(
        max_length=100,
        db_comment="The primary key of the source historical record this entry was derived from, stringified since historical record PKs can be int or UUID depending on the model.",
    )

    class Meta:
        app_label = "audit_log"
        db_table = f'{Schemas.COMMON.value}"."audit_log'
        db_table_comment = "An append-only audit trail of changes to audited entities, derived from django-simple-history historical records."
        constraints = [
            models.UniqueConstraint(
                fields=["history_record_content_type", "history_record_id"],
                name="unique_audit_log_per_history_record",
                violation_error_message="An audit log entry already exists for this historical record.",
            )
        ]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"], name="audit_log_entity_idx"),
        ]
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"AuditLog({self.entity_type}={self.entity_id}, action={self.action}, timestamp={self.timestamp})"
