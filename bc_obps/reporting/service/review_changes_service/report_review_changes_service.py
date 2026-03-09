from typing import Any, Dict, List
from deepdiff import DeepDiff
from deepdiff.helper import NotPresent

from .diff_helpers import _DIFF_KWARGS, _CHANGE_TYPE_MAP, detect_renames, diff_sections, fix_facility_uuid_in_path


class ReportReviewChangesService:
    @classmethod
    def get_report_version_diff_changes(cls, previous: dict, current: dict) -> List[Dict[str, Any]]:
        """
        Compare two serialized report versions and return a list of human-readable field changes.
        Each entry has: field, old_value, new_value, change_type (added / removed / modified).
        """
        previous, current = previous or {}, current or {}
        changes: List[Dict[str, Any]] = []

        # Facility reports
        prev_facs: Dict[str, dict] = previous.get('facility_reports') or {}
        curr_facs: Dict[str, dict] = current.get('facility_reports') or {}
        changes.extend(detect_renames(prev_facs, curr_facs))
        changes.extend(diff_sections(prev_facs, curr_facs, "root['facility_reports']"))

        # Compliance products
        prod_root = "root['report_compliance_summary']['products']"
        prev_products = {
            p['name']: p for p in (previous.get('report_compliance_summary') or {}).get('products', []) if p.get('name')
        }
        curr_products = {
            p['name']: p for p in (current.get('report_compliance_summary') or {}).get('products', []) if p.get('name')
        }
        changes.extend(diff_sections(prev_products, curr_products, prod_root))

        # All remaining top-level fields (registration_purpose included — DeepDiff handles it natively)
        diff = DeepDiff(previous, current, exclude_regex_paths=[r".*?facility_reports.*"], **_DIFF_KWARGS)
        for diff_key, items in diff.items():
            for item in items:
                if item.path().startswith(prod_root):
                    continue
                changes.append(
                    {
                        "field": fix_facility_uuid_in_path(item.path(), current),
                        "old_value": None if isinstance(item.t1, NotPresent) else item.t1,
                        "new_value": None if isinstance(item.t2, NotPresent) else item.t2,
                        "change_type": _CHANGE_TYPE_MAP.get(diff_key, 'modified'),
                    }
                )

        return changes
