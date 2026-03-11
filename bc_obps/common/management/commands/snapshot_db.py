import json
import os
from django.apps import apps as django_apps
from django.core.management.base import BaseCommand, CommandError

EXCLUDED_FIELDS = frozenset(
    {
        "id",
        "created_at",
        "updated_at",
        "archived_at",
        "created_by",
        "created_by_id",
        "updated_by",
        "updated_by_id",
        "archived_by",
        "archived_by_id",
    }
)


def natural_key(obj) -> str | None:
    """
    Return a stable, PK-independent string identifying obj.

    Joins all non-PK, non-excluded, non-relational field values so the result
    is completely generic — no model-specific attribute lists required.
    """
    if obj is None:
        return None
    parts = [
        str(getattr(obj, f.attname))
        for f in obj._meta.concrete_fields
        if not f.primary_key
        and not f.is_relation
        and f.name not in EXCLUDED_FIELDS
        and getattr(obj, f.attname) is not None
    ]
    return "|".join(parts) if parts else str(obj.pk)


def build_row(obj) -> dict:
    """
    Build a stable, PK-independent dict representation of a model instance.

    FK fields → natural key string of the related object
    M2M fields → sorted list of natural key strings
    All other non-excluded, non-PK fields → str(value)
    """
    meta = obj._meta
    row = {}
    for field in meta.concrete_fields:
        if field.primary_key or field.name in EXCLUDED_FIELDS:
            continue
        if field.is_relation:
            row[field.name] = natural_key(getattr(obj, field.name))
        else:
            val = getattr(obj, field.attname)
            row[field.name] = str(val) if val is not None else None
    for m2m in meta.many_to_many:
        row[m2m.name] = sorted(natural_key(r) for r in getattr(obj, m2m.name).all())
    return row


def snapshot_model(model) -> dict:
    """
    Return {'count': N, 'rows': [...]} for *model*, with rows sorted by their JSON content.
    """
    meta = model._meta
    fk_names = [f.name for f in meta.concrete_fields if f.is_relation and f.name not in EXCLUDED_FIELDS]
    m2m_names = [f.name for f in meta.many_to_many]

    qs = model.objects.all()
    if fk_names:
        qs = qs.select_related(*fk_names)
    if m2m_names:
        qs = qs.prefetch_related(*m2m_names)

    rows = sorted(
        (build_row(obj) for obj in qs),
        key=lambda r: json.dumps(r, sort_keys=True, default=str),
    )
    return {"count": len(rows), "rows": rows}


def is_historical_model(model) -> bool:
    return model.__name__.startswith("Historical") or hasattr(model, "_history_date")


class Command(BaseCommand):
    help = "Snapshot seeded DB tables to JSON for squash-migration integrity tests"

    def add_arguments(self, parser):
        parser.add_argument(
            "--apps",
            required=True,
            help="Comma-separated app labels (e.g. registration or registration,reporting)",
        )
        parser.add_argument(
            "--output",
            help="Output JSON path. Omit to write one file per app at <app>/fixtures/snapshots/db_snapshot.json",
        )

    def handle(self, *args, **options):
        app_labels = [a.strip() for a in options["apps"].split(",")]
        explicit_output = options.get("output")

        if explicit_output:
            self._snapshot_to_file(app_labels, explicit_output)
        else:
            for app_label in app_labels:
                self._snapshot_to_file(
                    [app_label],
                    f"{app_label}/fixtures/snapshots/db_snapshot.json",
                )

    def _snapshot_to_file(self, app_labels, output):
        snapshot = {}
        total_rows = 0

        for app_label in app_labels:
            try:
                app_config = django_apps.get_app_config(app_label)
            except LookupError:
                raise CommandError(f"App not found: {app_label}")

            for model in sorted(
                (m for m in app_config.get_models() if not is_historical_model(m)),
                key=lambda m: m.__name__,
            ):
                table_key = f"{app_label}.{model.__name__}"
                data = snapshot_model(model)
                snapshot[table_key] = data
                total_rows += data["count"]
                self.stdout.write(f"  {table_key:60s} {data['count']:>6} rows")

        os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
        with open(output, "w") as f:
            json.dump(snapshot, f, indent=2, sort_keys=True)

        self.stdout.write(
            self.style.SUCCESS(f"\nSnapshot saved → {output}\n" f"Tables: {len(snapshot)}  |  Total rows: {total_rows}")
        )
