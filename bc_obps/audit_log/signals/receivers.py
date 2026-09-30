import logging
import threading
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from uuid import UUID

from django.contrib.contenttypes.models import ContentType
from django.db import connection, transaction
from django.dispatch import receiver
from simple_history.signals import post_create_historical_record

from audit_log.config.registry import AuditedSource, get_source_for_model
from audit_log.models import AuditLog
from registration.models import User

logger = logging.getLogger(__name__)

# django-simple-history's `history_type` values: see simple_history.models.HistoricalRecords
HISTORY_TYPE_TO_ACTION = {
    "+": AuditLog.Action.CREATE,
    "~": AuditLog.Action.UPDATE,
    "-": AuditLog.Action.DELETE,
}

# When a group of coalesced events (see `_PendingAuditEntry` below) disagree on action, prefer
# whichever has the highest priority here. CREATE wins because a watched M2M field being set
# right after a row is first created (its own separate django-simple-history event) is still
# part of that row's initial creation, not a later update. DELETE outranks UPDATE because the
# entity's final fate in the transaction is more informative than an incidental field edit that
# preceded it.
_ACTION_PRIORITY: Dict[str, int] = {
    AuditLog.Action.CREATE: 2,
    AuditLog.Action.DELETE: 1,
    AuditLog.Action.UPDATE: 0,
}


@dataclass
class _PendingAuditEntry:
    """An AuditLog row under construction, possibly still being merged with more events."""

    entity_type: str
    entity_id: str
    action: str
    changed_fields: List[str]
    snapshot: Dict[str, Dict[str, Any]]
    timestamp: Any
    reason: Optional[str]
    actor: Optional[User]
    actor_guid: Optional[UUID]
    history_record_content_type: ContentType
    history_record_id: str


# Thread-local buffer of in-flight AuditLog entries, keyed by (entity_type, entity_id), scoped
# to the lifetime of a single DB transaction (see `_buffer_and_schedule_flush`).
_local = threading.local()


def _pending_groups() -> Dict[Tuple[str, str], _PendingAuditEntry]:
    if not hasattr(_local, "pending_groups"):
        _local.pending_groups = {}
    return _local.pending_groups  # type: ignore[no-any-return]


@receiver(post_create_historical_record)
def handle_post_create_historical_record(sender: Any, **kwargs: Any) -> None:
    """
    Fires whenever django-simple-history creates a historical record for any tracked model.

    Checks whether the model is registered in the audit_log app's AUDITED_VIEWS registry and,
    if so, buffers a corresponding AuditLog entry (see `_buffer_and_schedule_flush`). No-ops
    immediately for models that aren't registered -- this must stay cheap, since it fires for
    every historically-tracked model in the codebase, not just the handful that are audited.
    """
    base_model = getattr(sender, "instance_type", None)
    if base_model is None:
        return

    registration = get_source_for_model(base_model)
    if registration is None:
        return
    view, source = registration

    history_instance = kwargs["history_instance"]
    action = HISTORY_TYPE_TO_ACTION.get(history_instance.history_type)
    if action is None:
        logger.warning("Unrecognized history_type '%s' on %s", history_instance.history_type, sender)
        return

    changed_fields = _resolve_changed_fields(history_instance, action, source)
    if action == AuditLog.Action.UPDATE and not changed_fields:
        # Only unwatched fields changed on this update -- nothing worth logging.
        return

    content_type = ContentType.objects.get_for_model(sender)
    history_record_id = str(history_instance.pk)

    if AuditLog.objects.filter(
        history_record_content_type=content_type,
        history_record_id=history_record_id,
    ).exists():
        # Defensive idempotency guard: the signal shouldn't double-fire under normal operation,
        # but this keeps retries/test setups safe.
        return

    root_id = source.root_id_resolver(history_instance.instance)
    actor, actor_guid = _resolve_actor()

    entry = _PendingAuditEntry(
        entity_type=view.entity_type,
        entity_id=str(root_id),
        action=action,
        changed_fields=changed_fields,
        snapshot=_build_snapshot(history_instance.instance, source, action, root_id),
        timestamp=history_instance.history_date,
        reason=history_instance.history_change_reason,
        actor=actor,
        actor_guid=actor_guid,
        history_record_content_type=content_type,
        history_record_id=history_record_id,
    )
    _buffer_and_schedule_flush(entry)


def _buffer_and_schedule_flush(entry: _PendingAuditEntry) -> None:
    """
    Coalesces AuditLog entries for the same entity within one DB transaction into a single row.

    A single logical edit (e.g. updating an Operation's name and its regulated products in one
    request) can trigger django-simple-history's `post_create_historical_record` signal more
    than once -- a plain field save and a watched M2M field's `.set()` fire it independently,
    even though both happen inside the same `@transaction.atomic()` service call. Without this,
    each fire would produce its own AuditLog row, splitting one user action into several.

    Entries for the same (entity_type, entity_id) are buffered in thread-local storage and
    merged until the current transaction commits, at which point the merged result is written
    as one row. If there's no open transaction, `transaction.on_commit` runs the callback
    immediately, so single-write updates behave exactly as before.
    """
    pending = _pending_groups()
    key = (entry.entity_type, entry.entity_id)
    existing = pending.get(key)

    if existing is None:
        pending[key] = entry
        transaction.on_commit(lambda: _flush_pending_entry(key))
        return

    existing.action = _merge_action(existing.action, entry.action)
    for field_name in entry.changed_fields:
        if field_name not in existing.changed_fields:
            existing.changed_fields.append(field_name)
    # Merge rather than replace: a view backed by more than one source (e.g. `report`, sourced
    # from both ReportVersion and ReportOperation) can have each source fire its own event within
    # the same transaction, and each event's snapshot only covers its own source's watched fields.
    # Replacing wholesale would drop the earlier source's fields entirely. Where both events touch
    # the same field name, the later event's value wins, since it's the more current state.
    existing.snapshot = {**existing.snapshot, **entry.snapshot}
    existing.reason = existing.reason or entry.reason
    existing.history_record_content_type = entry.history_record_content_type
    existing.history_record_id = entry.history_record_id
    # timestamp/actor/actor_guid are left as-is, from the first event in the group.


def _merge_action(existing_action: str, incoming_action: str) -> str:
    if _ACTION_PRIORITY[incoming_action] > _ACTION_PRIORITY[existing_action]:
        return incoming_action
    return existing_action


def _flush_pending_entry(key: Tuple[str, str]) -> None:
    """
    Writes one AuditLog row for a buffered group, once its transaction has committed.

    A no-op if the group was already flushed -- `_buffer_and_schedule_flush` registers this
    callback on the *first* event for a given key, and by the time callbacks run (after all
    application code in the transaction has executed), the group holds every event's merged
    data, so only that first-registered callback needs to do anything.
    """
    entry = _pending_groups().pop(key, None)
    if entry is None:
        return

    if AuditLog.objects.filter(
        history_record_content_type=entry.history_record_content_type,
        history_record_id=entry.history_record_id,
    ).exists():
        return

    AuditLog.objects.create(
        entity_type=entry.entity_type,
        entity_id=entry.entity_id,
        action=entry.action,
        actor=entry.actor,
        actor_guid=entry.actor_guid,
        timestamp=entry.timestamp,
        snapshot=entry.snapshot,
        changed_fields=entry.changed_fields,
        reason=entry.reason,
        history_record_content_type=entry.history_record_content_type,
        history_record_id=entry.history_record_id,
    )


def _resolve_actor() -> Tuple[Optional[User], Optional[UUID]]:
    """
    Resolve the acting user from the Postgres session's `my.guid` setting, which
    `rls.middleware.rls.RlsMiddleware` sets at the start of every request for RLS purposes.

    This deliberately does NOT use django-simple-history's own `history_user`/`history_user_id`
    (sourced from `TimeStampedModel._history_user`, which reads `self.archived_by`/`updated_by`/
    `created_by` off the in-memory model instance). Those columns are actually populated by a
    Postgres BEFORE INSERT/UPDATE trigger reading this same `my.guid` setting -- but the trigger
    writes directly to the DB row, and Django never refreshes the in-memory instance afterward,
    so `_history_user` sees stale (usually null) values at the moment this signal fires. Reading
    `my.guid` directly gets the real, current actor instead.
    """
    with connection.cursor() as cursor:
        cursor.execute("SELECT current_setting('my.guid', true)")
        raw_guid = cursor.fetchone()[0]

    if not raw_guid:
        return None, None

    actor_guid = UUID(raw_guid)
    actor = User.objects.filter(user_guid=actor_guid).first()
    return actor, actor_guid


def _resolve_changed_fields(history_instance: Any, action: str, source: AuditedSource) -> List[str]:
    """
    Determine which of the source's watched fields changed as part of this event.

    - create: the full watched-field list (there's nothing to diff against).
    - delete: empty -- the interesting content of a delete event is that it happened, not a diff.
    - update: exactly the watched fields that differ from the previous historical record.
    """
    watched_field_names = list(source.watched_fields.keys())

    if action == AuditLog.Action.CREATE:
        return watched_field_names
    if action == AuditLog.Action.DELETE:
        return []

    prev_record = history_instance.prev_record
    if prev_record is None:
        # No previous historical record to diff against (e.g. history tracking was enabled
        # after the row already existed). Treat this like an initial snapshot.
        return watched_field_names

    delta = history_instance.diff_against(
        prev_record,
        included_fields=watched_field_names,
        foreign_keys_are_objs=True,
    )
    return list(delta.changed_fields)


def _build_snapshot(instance: Any, source: AuditedSource, action: str, root_id: Any) -> Dict[str, Dict[str, Any]]:
    """
    Build a {field_key: {"label": ..., "value": <resolved display value>}} snapshot covering
    ALL of the source's watched fields (not just the changed ones).

    On a DELETE, a field named in `source.delete_field_overrides` has its plain value replaced
    by that override's result instead -- see `AuditedSource.delete_field_overrides` for why.
    """
    snapshot = {}
    for field_name, watched_field in source.watched_fields.items():
        raw_value = getattr(instance, field_name, None)
        snapshot[field_name] = {
            "label": watched_field.label,
            "value": watched_field.resolve(raw_value),
        }

    if action == AuditLog.Action.DELETE:
        for field_name, override_resolver in source.delete_field_overrides.items():
            if field_name in snapshot:
                snapshot[field_name]["value"] = override_resolver(instance, root_id)

    return snapshot
