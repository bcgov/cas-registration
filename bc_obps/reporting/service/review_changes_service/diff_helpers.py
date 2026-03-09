from typing import Any, Dict, List
from deepdiff import DeepDiff
from deepdiff.helper import NotPresent
import re

_DIFF_KWARGS: Dict[str, Any] = dict(ignore_order=True, verbose_level=2, view='tree', threshold_to_diff_deeper=0)

_CHANGE_TYPE_MAP: Dict[str, str] = {
    'values_changed': 'modified',
    'type_changes': 'modified',
    'dictionary_item_added': 'added',
    'iterable_item_added': 'added',
    'dictionary_item_removed': 'removed',
    'iterable_item_removed': 'removed',
    'attribute_added': 'added',
    'attribute_removed': 'removed',
}


def detect_renames(prev: Dict[str, dict], curr: Dict[str, dict]) -> List[Dict[str, Any]]:
    """
    Detect facilities with the same UUID but a different name key.
    Mutates prev so diff_sections doesn't produce false add+remove pairs.
    """
    prev_by_uuid = {str(f.get('facility')): k for k, f in prev.items() if isinstance(f, dict) and f.get('facility')}
    curr_by_uuid = {str(f.get('facility')): k for k, f in curr.items() if isinstance(f, dict) and f.get('facility')}

    changes = []
    for uuid in set(prev_by_uuid) & set(curr_by_uuid):
        old_name, new_name = prev_by_uuid[uuid], curr_by_uuid[uuid]
        if old_name != new_name:
            changes.append(
                {
                    "field": f"root['facility_reports']['{new_name}']['facility_name']",
                    "old_value": old_name,
                    "new_value": new_name,
                    "change_type": "modified",
                }
            )
            fac = prev.pop(old_name)
            prev[new_name] = {**fac, 'facility_name': new_name} if 'facility_name' in fac else fac

    return changes


def diff_sections(prev: Dict[str, dict], curr: Dict[str, dict], path_root: str) -> List[Dict[str, Any]]:
    """Diff two name-keyed dicts, returning added/removed/modified entries."""
    changes = []

    for name in prev.keys() - curr.keys():
        changes.append(
            {"field": f"{path_root}['{name}']", "old_value": prev[name], "new_value": None, "change_type": "removed"}
        )

    for name in curr.keys() - prev.keys():
        changes.append(
            {"field": f"{path_root}['{name}']", "old_value": None, "new_value": curr[name], "change_type": "added"}
        )

    for name in prev.keys() & curr.keys():
        for diff_key, items in DeepDiff(prev[name], curr[name], **_DIFF_KWARGS).items():
            for item in items:
                changes.append(
                    {
                        "field": f"{path_root}['{name}']{item.path()[4:]}",
                        "old_value": None if isinstance(item.t1, NotPresent) else item.t1,
                        "new_value": None if isinstance(item.t2, NotPresent) else item.t2,
                        "change_type": _CHANGE_TYPE_MAP.get(diff_key, 'modified'),
                    }
                )

    return changes


def fix_facility_uuid_in_path(field: str, current: dict) -> str:
    """Replace a facility UUID in a diff path with the human-readable facility name."""
    m = re.match(r"root\['facility_reports'\]\['([^']+)'\]", field)
    if m:
        fac = current.get('facility_reports', {}).get(m.group(1))
        if fac and 'facility_name' in fac:
            return field.replace(f"['{m.group(1)}']", f"['{fac['facility_name']}']", 1)
    return field
