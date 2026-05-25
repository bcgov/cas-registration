from typing import Any, Dict, List
from deepdiff import DeepDiff
from deepdiff.helper import NotPresent

from reporting.models import ReportingField

from .diff_helpers import _DIFF_KWARGS, _CHANGE_TYPE_MAP, detect_renames, diff_sections, fix_facility_uuid_in_path


NOISY_DIFF_KEYS = {
    "report_version",
    "is_supplementary_report",
    "is_latest_submitted",
    "status",
}


def _remove_noisy_diff_keys(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _remove_noisy_diff_keys(child_value)
            for key, child_value in value.items()
            if key not in NOISY_DIFF_KEYS
        }

    if isinstance(value, list):
        return [_remove_noisy_diff_keys(item) for item in value]

    return value


def _get_reporting_field_display_titles() -> Dict[str, str]:
    return {
        reporting_field.slug: reporting_field.field_display_title or reporting_field.field_name
        for reporting_field in ReportingField.objects.only(
            "slug",
            "field_display_title",
            "field_name",
        )
    }


def _get_field_display_title(field_path: str, field_display_titles: Dict[str, str]) -> str | None:
    field_name = field_path.split("['")[-1].removesuffix("']")

    return field_display_titles.get(field_name)


class ReportReviewChangesService:
    @classmethod
    def get_report_version_diff_changes(cls, previous: dict, current: dict) -> List[Dict[str, Any]]:
        """
        Compare two serialized report versions and return a list of human-readable field changes.
        Each entry has: field, field_display_title, old_value, new_value, change_type.
        """
        previous, current = previous or {}, current or {}

        previous = _remove_noisy_diff_keys(previous)
        current = _remove_noisy_diff_keys(current)

        field_display_titles = _get_reporting_field_display_titles()
        changes: List[Dict[str, Any]] = []

        # Facility reports
        prev_facs: Dict[str, dict] = previous.get('facility_reports') or {}
        curr_facs: Dict[str, dict] = current.get('facility_reports') or {}
        changes.extend(detect_renames(prev_facs, curr_facs))
        changes.extend(diff_sections(prev_facs, curr_facs, "root['facility_reports']"))

        for change in changes:
            change["field_display_title"] = _get_field_display_title(change["field"], field_display_titles)

        # Compliance products
        prod_root = "root['report_compliance_summary']['products']"
        prev_products = {
            p['name']: p for p in (previous.get('report_compliance_summary') or {}).get('products', []) if p.get('name')
        }
        curr_products = {
            p['name']: p for p in (current.get('report_compliance_summary') or {}).get('products', []) if p.get('name')
        }

        product_changes = diff_sections(prev_products, curr_products, prod_root)
        for change in product_changes:
            change["field_display_title"] = _get_field_display_title(change["field"], field_display_titles)

        changes.extend(product_changes)

        # All remaining top-level fields
        diff = DeepDiff(previous, current, exclude_regex_paths=[r".*?facility_reports.*"], **_DIFF_KWARGS)
        for diff_key, items in diff.items():
            changes = changes + [
                {
                    "field": fix_facility_uuid_in_path(item.path(), current),
                    "field_display_title": _get_field_display_title(item.path(), field_display_titles),
                    "old_value": None if isinstance(item.t1, NotPresent) else item.t1,
                    "new_value": None if isinstance(item.t2, NotPresent) else item.t2,
                    "change_type": _CHANGE_TYPE_MAP.get(diff_key, 'modified'),
                }
                for item in items
                if not item.path().startswith(prod_root)
            ]

        return changes
