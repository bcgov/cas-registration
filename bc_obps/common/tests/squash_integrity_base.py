import json
import os
import unittest
from django.apps import apps as django_apps
from django.test import TestCase
from common.management.commands.snapshot_db import (
    is_historical_model,
    snapshot_model,
)


class SquashIntegrityTestBase(TestCase):
    # Prevent pytest from collecting this base class directly.
    # Each app subclass must set __test__ = True to opt in.
    __test__ = False

    SNAPSHOT_APPS: list[str] = []
    SNAPSHOT_PATH: str = ""

    # Tables to skip entirely
    KNOWN_EXCLUSION_KEYS: set[str] = set()

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        if not cls.SNAPSHOT_APPS or not cls.SNAPSHOT_PATH:
            raise NotImplementedError("Subclasses must define SNAPSHOT_APPS and SNAPSHOT_PATH")
        # Load the reference snapshot captured from the original migrations
        cls.snapshot = cls._load_snapshot()
        # Capture the current DB state produced by the squashed migration
        cls.current = cls._serialize_current_db()

    @classmethod
    def _load_snapshot(cls) -> dict:
        # Skip (don't fail) if the snapshot file hasn't been generated yet
        if not os.path.exists(cls.SNAPSHOT_PATH):
            raise unittest.SkipTest(
                f"Snapshot not found at {cls.SNAPSHOT_PATH}. "
                f"Generate it with: python manage.py snapshot_db --apps {','.join(cls.SNAPSHOT_APPS)}"
            )
        with open(cls.SNAPSHOT_PATH) as f:
            result = json.load(f)
        return result

    @classmethod
    def _serialize_current_db(cls) -> dict:
        # Walk every non-historical model in SNAPSHOT_APPS and capture its rows
        current = {}
        for app_label in cls.SNAPSHOT_APPS:
            app_config = django_apps.get_app_config(app_label)
            for model in app_config.get_models():
                if is_historical_model(model):
                    continue
                table_key = f"{app_label}.{model.__name__}"
                current[table_key] = snapshot_model(model)
        return current

    def _active_keys(self) -> list[str]:
        # Snapshot keys minus any tables we're intentionally skipping
        result = sorted(k for k in self.snapshot if k not in self.KNOWN_EXCLUSION_KEYS)
        return result

    @staticmethod
    def _row_set(data: dict) -> set[str]:
        # Serialize each row as a stable JSON string so rows can be compared as a set
        # (order-independent, and PKs are already excluded by snapshot_model)
        return {json.dumps(r, sort_keys=True) for r in data["rows"]}

    # ── Tests ─────────────────────────────────────────────────────────────────

    def test_no_tables_missing_from_current_db(self):
        # Every table recorded in the snapshot must still exist after squashing
        missing = set(self._active_keys()) - set(self.current.keys())
        self.assertFalse(
            missing,
            "Tables present in snapshot but missing from current DB:\n" + "\n".join(f"  {k}" for k in sorted(missing)),
        )

    def test_no_extra_tables_in_current_db(self):
        # The squashed migration must not introduce tables that didn't exist before
        extra = set(self.current.keys()) - set(self.snapshot.keys())
        self.assertFalse(
            extra,
            "Tables present in current DB but NOT in snapshot:\n" + "\n".join(f"  {k}" for k in sorted(extra)),
        )

    def test_row_counts_match(self):
        # Each table must contain the same number of seed rows as the original
        failures = []
        for key in self._active_keys():
            if key not in self.current:
                continue
            expected = self.snapshot[key]["count"]
            actual = self.current[key]["count"]
            if actual != expected:
                failures.append(f"  {key}: expected {expected} rows, got {actual}")
        self.assertFalse(
            failures,
            "Row count mismatches:\n" + "\n".join(failures),
        )

    def test_row_content_matches(self):
        # Every row in every table must match the snapshot exactly.
        # Comparison is set-based (order doesn't matter) and PKs are excluded.
        failures = []
        for key in self._active_keys():
            if key not in self.current:
                continue

            expected_set = self._row_set(self.snapshot[key])
            actual_set = self._row_set(self.current[key])
            missing = expected_set - actual_set  # in snapshot but not in current DB
            extra = actual_set - expected_set  # in current DB but not in snapshot

            if not missing and not extra:
                continue

            def fmt(label, rows):
                preview = "\n".join(f"      {r}" for r in sorted(rows)[:10])
                truncated = f"\n      ... and {len(rows) - 10} more" if len(rows) > 10 else ""
                return f"    {len(rows)} row(s) {label}:\n{preview}{truncated}"

            lines = [f"  {key}:"]
            if missing:
                lines.append(fmt("in snapshot but NOT in current DB", missing))
            if extra:
                lines.append(fmt("in current DB but NOT in snapshot", extra))

            failures.append("\n".join(lines))

        self.assertFalse(
            failures,
            "Row content mismatches after squash:\n\n" + "\n\n".join(failures),
        )

    def test_column_names_match(self):
        # Each table must expose the same set of field names as captured in the snapshot
        failures = []
        for key in self._active_keys():
            if key not in self.current:
                continue

            snap_rows = self.snapshot[key]["rows"]
            curr_rows = self.current[key]["rows"]
            if not snap_rows and not curr_rows:
                continue  # both empty — nothing to compare

            snap_cols = set(snap_rows[0].keys()) if snap_rows else set()
            curr_cols = set(curr_rows[0].keys()) if curr_rows else set()
            if snap_cols != curr_cols:
                failures.append(
                    f"  {key}:\n"
                    f"    missing columns : {snap_cols - curr_cols}\n"
                    f"    extra columns   : {curr_cols - snap_cols}"
                )

        self.assertFalse(
            failures,
            "Column name mismatches:\n" + "\n".join(failures),
        )
