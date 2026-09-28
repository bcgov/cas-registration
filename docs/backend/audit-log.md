# Audit Log App

**Status: proof-of-concept.** The registry is intentionally hand-maintained rather than generic
(see [Adding a New Audited Entity Type](#adding-a-new-audited-entity-type)), and the endpoint has
no row-level security applied yet -- see [Known Limitations](#known-limitations) before relying
on this for anything production-facing.

## Overview

The audit log app (`bc_obps/audit_log`) provides a generic, append-only history of changes made
to a small set of "audited" entities (currently `Operation` and `Report`). Rather than tracking
changes itself, it derives its rows from [django-simple-history](https://django-simple-history.readthedocs.io/en/latest/)
historical records that already exist on those models, and re-shapes them into a display-ready,
entity-centric view:

- One row per logical change (create/update/delete), not per underlying DB write.
- A full snapshot of a curated set of "watched" fields at that point in time, not just the diff.
- A human-readable label for the field and its resolved display value (e.g. a foreign key
  resolved to a name, not an id).

This lets a frontend render "what changed and when" for an entity without knowing anything about
its underlying model shape.

## Architecture

### Core Components

- **`AuditLog` model** (`audit_log/models/audit_log.py`): the append-only table itself. Rows are
  never updated or archived once created.
- **Registry** (`audit_log/config/registry.py`): a hand-maintained mapping from historically-tracked
  source models to the audited "view" (entity type) they contribute rows to, and which of their
  fields are watched.
- **Signal receiver** (`audit_log/signals/receivers.py`): listens for django-simple-history's
  `post_create_historical_record` signal, checks the registry, and buffers/writes `AuditLog` rows.
- **Service** (`audit_log/service/audit_log_service.py`): read-side queries used by the API.
- **API** (`audit_log/api/audit_log.py`): a single `GET /audit-log/{entity_type}/{entity_id}` endpoint.

### Database Table

- `common.audit_log`: one row per coalesced change (see [Coalescing](#coalescing-multiple-historical-records-into-one-row)).
  Indexed on `(entity_type, entity_id)`. A unique constraint on
  `(history_record_content_type, history_record_id)` prevents the same underlying historical
  record from ever producing two rows.

## The Registry

Everything about what gets audited, and how, is declared in `AUDITED_VIEWS` in
`audit_log/config/registry.py` -- there's no auto-discovery. Each entry is an `AuditedView`:

```python
"operation": AuditedView(
    entity_type="operation",
    display_name_resolver=_resolve_operation_display_name,
    sources=[
        AuditedSource(
            model=Operation,
            root_id_resolver=lambda instance: instance.pk,
            watched_fields={
                "name": WatchedField(label="Operation Name"),
                "operator": WatchedField(
                    label="Operator",
                    resolver=lambda v: v.legal_name if v else None,
                ),
                ...
            },
        ),
    ],
),
```

- **`entity_type`**: the string used in the API path and stored on `AuditLog.entity_type`.
- **`display_name_resolver`**: resolves an `entity_id` to a human-readable label (e.g. an
  operation's name) by querying the _current_ live row, not an audit log snapshot -- so it still
  works for an entity with no audit history yet, and always reflects current state rather than
  whatever the name was at some point in the trail.
- **`sources`**: one or more historically-tracked models that contribute rows to this view.
  A view can have more than one source -- e.g. `report` is rooted at `Report`, but its rows come
  from changes to `ReportVersion`.
- **`root_id_resolver`**: maps a source model instance to the id the _view_ is keyed on. This
  doesn't have to be the source model's own pk -- `report`'s source is `ReportVersion`, but
  `root_id_resolver` returns `instance.report_id` so the whole version timeline (including a
  version later deleted, e.g. when a registration purpose change removes a draft) stays reachable
  under the stable parent `Report`'s id.
- **`watched_fields`**: a `{field_name: WatchedField}` map. Only these fields are diffed, snapshotted,
  and displayed -- every other field on the source model is invisible to the audit log. A
  `WatchedField` can supply a `resolver` to turn a raw value (an FK, a queryset, etc.) into a
  display-friendly one, e.g. resolving `operator` to `operator.legal_name`.

## How an AuditLog Row Gets Created

1. Application code saves a historically-tracked model (`Operation`, `ReportVersion`, etc.), and
   django-simple-history creates a `Historical<Model>` record as usual and fires
   `post_create_historical_record`.
2. `handle_post_create_historical_record` looks up the source model in the registry via
   `get_source_for_model`. If it isn't registered, this is a no-op -- this must stay cheap, since
   it fires for _every_ historically-tracked model in the codebase, not just audited ones.
3. The historical record's `history_type` (`+`/`~`/`-`) maps to `AuditLog.Action`
   (`CREATE`/`UPDATE`/`DELETE`).
4. **Changed fields** are resolved (`_resolve_changed_fields`):
   - `CREATE`: every watched field (nothing to diff against).
   - `DELETE`: none -- what matters is that it happened, not a diff.
   - `UPDATE`: diffed against `history_instance.prev_record`, restricted to `watched_fields`, via
     simple_history's `diff_against(..., foreign_keys_are_objs=True)`. An update where only
     _unwatched_ fields changed produces no changed fields and is dropped entirely.
5. A full **snapshot** of all watched fields (not just the changed ones) is built from the current
   instance state, each resolved through its `WatchedField.resolver`.
6. The **actor** is resolved from the Postgres session variable `my.guid`, set by
   `rls.middleware.rls.RlsMiddleware` at the start of every request -- deliberately _not_ from
   simple_history's own `history_user`, because that's sourced from the in-memory model instance's
   `created_by`/`updated_by`, which a DB-level trigger populates without Django ever refreshing the
   instance. Reading `my.guid` directly gets the real actor at signal time.
7. The resulting entry is buffered and written once its transaction commits (see below).

### Coalescing Multiple Historical Records into One Row

A single logical edit can trigger `post_create_historical_record` more than once -- e.g. updating
an `Operation`'s `name` and its `regulated_products` M2M in one service call fires the signal
separately for the plain field save and for the M2M `.set()`, even inside one
`@transaction.atomic()` block. Left alone, that would split one user action into two audit log
rows.

To prevent this, entries for the same `(entity_type, entity_id)` are buffered in thread-local
storage (`_pending_groups`) and merged as more events arrive within the same DB transaction. The
_first_ event for a key registers a `transaction.on_commit` callback that flushes the merged
result as a single `AuditLog.objects.create(...)` once the transaction commits (if there's no open
transaction, `on_commit` runs immediately, so single-write updates are unaffected). Merging rules:

- `action` is resolved by priority: `CREATE` > `DELETE` > `UPDATE` (`_ACTION_PRIORITY`) -- e.g. a
  watched M2M set right after a row's own creation is still part of that creation, not a
  follow-up update.
- `changed_fields` accumulates the union across events.
- `snapshot` takes the latest event's snapshot, since every event in a transaction is built from
  the same mutated in-memory instance and each is already a full snapshot.
- `reason`, `timestamp`, `actor`/`actor_guid` are taken from the _first_ event in the group.

### Recording a Reason

`AuditLog.reason` is sourced from the triggering historical record's `history_change_reason`. To
set one from a service, assign simple_history's dynamic `_change_reason` attribute before saving
or deleting:

```python
setattr(report_version, "_change_reason", "Deleted because the operation's registration purpose changed")
report_version.delete()
```

See `ReportVersionService.delete_report_version`'s `reason` parameter for a real example.

## Adding a New Audited Entity Type

1. Make sure the source model has `history = HistoricalRecords(...)` (see `ReportVersion` for an
   example, including how to name the history table under the `erc_history` schema).
2. Add an `AuditedView` entry to `AUDITED_VIEWS` in `audit_log/config/registry.py`: pick an
   `entity_type` string, write a `display_name_resolver`, and declare one or more `AuditedSource`
   entries with the fields you want watched.
3. That's it -- no changes to the signal receiver, service, or API are needed. The registry is the
   single point of extension.

There is deliberately no generic/pluggable framework here (see the registry module's docstring) --
this is a POC-scoped, hand-maintained mapping.

## API

`GET /audit-log/{entity_type}/{entity_id}` returns the entity's resolved display name plus its
audit log entries, most recent first:

```json
{
  "entity_display_name": "Banana LFO",
  "entries": [
    {
      "action": "update",
      "timestamp": "2026-09-20T18:32:01+00:00",
      "snapshot": {
        "name": { "label": "Operation Name", "value": "Banana LFO" }
      },
      "changed_fields": ["name"],
      "reason": null,
      "actor_guid": "...",
      "actor_display_name": "Jane Smith"
    }
  ]
}
```

## Frontend

- `getAuditLog(entityType, entityId)` (`bciers/libs/actions/src/api/getAuditLog.ts`) calls the
  endpoint through the shared `actionHandler`.
- `AuditLogView` (`bciers/libs/components/src/auditLog/AuditLogView.tsx`) is a shared server
  component: it fetches the log, collects the union of watched-field columns seen across all
  entries (a field added to the registry later won't appear in older snapshots), and renders a
  plain MUI table, highlighting changed fields with an old→new diff.
- Each app exposes its own thin route at `.../audit-log/[entityType]/[entityId]/page.tsx`, built
  with `defaultPageFactory(AuditLogView)` (see [nextjs-page-components.md](../frontend/nextjs-page-components.md)).

## Known Limitations

- **No row-level security.** The endpoint currently uses only role-based `authorize()`, so any
  authorized user can query the audit log for any `entity_id` by guessing it. This must be
  addressed (see the `TODO` in `audit_log/api/audit_log.py`) before this is production-ready.
- **Hand-maintained registry.** Adding an audited entity type is a manual code change, by design,
  not a config-driven one.
- **No backfill -- history is not backtracked.** `AuditLog` rows are only ever created by
  `handle_post_create_historical_record` reacting to the `post_create_historical_record` signal
  _as it fires_. There is no management command or data migration that walks existing
  `Historical<Model>` rows and retroactively creates `AuditLog` entries from them. This matters
  differently depending on the source model's history:
  - `Operation` already has `HistoricalRecords` in production today, with real change history
    going back to whenever that tracking started. None of that pre-existing history will appear
    in `audit_log` -- only operation changes made _after_ this feature deploys will. An operation
    that's years old will show an audit log that looks like it starts from a blank slate on
    deploy day, even though real prior changes exist in `HistoricalOperation`.
  - `ReportVersion`'s `history = HistoricalRecords(...)` is itself new in this change (see
    `reporting/migrations/0215_historicalreportversion.py`), so there's no pre-existing history to
    miss there -- its audit log and its underlying historical table both start from zero at the
    same time.
  - Consequently, the _first_ post-deploy save of any pre-existing `ReportVersion` row has no prior
    historical record to diff against, so `_resolve_changed_fields` treats it like a create and
    reports every watched field (`status`, `report_type`) as changed, even if only one actually
    did. It self-corrects from the second update onward, once a real `prev_record` exists.
