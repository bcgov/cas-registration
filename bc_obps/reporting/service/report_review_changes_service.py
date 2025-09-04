from typing import Any, Dict, List, Optional, Union
from deepdiff import DeepDiff
import logging
import re
from collections import namedtuple

logger = logging.getLogger(__name__)

ChangeItem = namedtuple('ChangeItem', ['path', 'old_value', 'new_value', 'change_type'])


class ReportReviewChangesService:
    """
    Service to process report version differences in a simplified, modernized way.
    """

    CONFIGS: List[Dict[str, Any]] = [
        {
            'regex': r"root\['report_new_entrant'\]\[(\d+)\]\['productions'\]\[(\d+)\](.*)",
            'index_groups': [1, 2],
            'root': 'report_new_entrant',
            'subkeys': ['productions'],
            'name_key': 'product',
            'format': "root['report_new_entrant'][{entrant_idx}]['productions']['{name}']{suffix}",
            'suffix_group': 3,
        },
        {
            'regex': r"root\['report_new_entrant'\]\[(\d+)\]\['report_new_entrant_emission'\]\[(\d+)\](.*)",
            'index_groups': [1, 2],
            'root': 'report_new_entrant',
            'subkeys': ['report_new_entrant_emission'],
            'name_key': 'emission_category',
            'format': "root['report_new_entrant'][{entrant_idx}]['report_new_entrant_emission']['{name}']{suffix}",
            'suffix_group': 3,
        },
    ]

    @staticmethod
    def _replace_emission_category(val: Any) -> Any:
        if isinstance(val, dict) and 'emission_category_id' in val and 'emission_category_name' in val:
            val = val.copy()
            val['emission_category_id'] = val['emission_category_name']
        return val

    @staticmethod
    def get_value_by_path(obj: dict, path_str: str) -> Any:
        """
        Traverse a nested dictionary using a string path and return the value.
        Example: "root['facility_reports'][0]['facility_name']"
        """
        keys = re.findall(r"\[(?:'([^']+)'|(\d+))\]", path_str)
        for string_key, numeric_key in keys:
            obj = obj[string_key if string_key else int(numeric_key)]
        return obj

    @staticmethod
    def _get_item_by_indexes(
        serialized_data: dict, root: str, subkeys: List[str], idxs: List[int]
    ) -> Optional[Union[dict, Any]]:
        """
        Retrieve nested item using root, subkeys, and list of indexes.
        Returns None if any index is out of range.
        """
        data = serialized_data.get(root, [])
        for i, key in enumerate(subkeys):
            if idxs[i] >= len(data):
                return None
            data = data[idxs[i]].get(key, [])
        return data[idxs[-1]] if isinstance(data, list) else data

    @classmethod
    def _parse_deepdiff_items(cls, diff: DeepDiff, prev: dict, curr: dict) -> List[ChangeItem]:
        """
        Convert DeepDiff output into a list of structured change dicts.
        Handles old/new values and change type extraction consistently.
        """
        results = []
        for change_type, items in diff.items():
            if isinstance(items, dict):
                items = list(items.items())
            else:
                items = [(path, None) for path in items]

            for path, change_data in items:
                old_val, new_val, ct = None, None, 'modified'

                if change_type == "values_changed":
                    old_val = change_data.get('old_value')
                    new_val = change_data.get('new_value')
                elif change_type.endswith("added") or change_type in ["dictionary_item_added", "iterable_item_added"]:
                    new_val = change_data or cls._get_value_by_path(curr, path)
                    ct = 'added'
                elif change_type.endswith("removed") or change_type in [
                    "dictionary_item_removed",
                    "iterable_item_removed",
                ]:
                    old_val = change_data or cls._get_value_by_path(prev, path)
                    ct = 'removed'
                elif change_type == "type_changes":
                    old_val = change_data.get('old_value')
                    new_val = change_data.get('new_value')

                results.append(ChangeItem(path, old_val, new_val, ct))

        return results

    @staticmethod
    def _replace_index_with_name(path: str, serialized_data: dict, config: dict) -> str:
        """
        Replace numeric indexes in a diff path with human-readable names using config.
        Returns original path if replacement fails.
        """
        match = re.match(config['regex'], path)
        if match and serialized_data:
            idxs = [int(match.group(i)) for i in config['index_groups']]
            item = ReportReviewChangesService._get_item_by_indexes(
                serialized_data, config['root'], config['subkeys'], idxs
            )
            if item:
                name = item.get(config['name_key'])
                if isinstance(name, str):
                    return str(
                        config['format'].format(
                            entrant_idx=idxs[0], name=name, suffix=match.group(config['suffix_group'])
                        )
                    )
        return path

    @classmethod
    def process_change(
        cls,
        path: str,
        old_val: Any,
        new_val: Any,
        change_type: str,
        serialized_data: Optional[dict] = None,
    ) -> Dict[str, Any]:
        """
        Process a diff change and return a dict with human-readable field and values.
        Applies index-to-name replacement and emission category renaming.
        """
        serialized_data = serialized_data or {}
        field = path
        for config in cls.CONFIGS:
            new_field = cls._replace_index_with_name(path, serialized_data, config)
            if new_field != path:
                field = new_field
                break

        old_val = cls._replace_emission_category(old_val)
        new_val = cls._replace_emission_category(new_val)
        return {
            "field": field,
            "old_value": old_val,
            "new_value": new_val,
            "change_type": change_type,
        }

    @staticmethod
    def _get_value_by_path(obj: dict, path_str: str) -> Any:
        keys = re.findall(r"\[(?:'([^']+)'|(\d+))\]", path_str)
        for str_key, num_key in keys:
            obj = obj[str_key if str_key else int(num_key)]
        return obj

    @classmethod
    def get_report_version_diff_changes(cls, previous: dict, current: dict) -> list:
        changes = []

        # 1. Facility name changes
        prev_facilities = previous.get("facility_reports", {})
        curr_facilities = current.get("facility_reports", {})
        facility_name_map = {}

        for old_fac_name, old_fac in prev_facilities.items():
            for new_fac_name, new_fac in curr_facilities.items():
                if old_fac.get('facility') == new_fac.get('facility') and old_fac.get('facility_name') != new_fac.get(
                    'facility_name'
                ):
                    facility_name_map[old_fac_name] = new_fac_name
                    changes.append(
                        {
                            "field": f"root['facility_reports']['{new_fac_name}']['facility_name']",
                            "old_value": old_fac.get("facility_name"),
                            "new_value": new_fac.get("facility_name"),
                            "change_type": "modified",
                        }
                    )

        # 2. Facility reports diff
        for fac_name, curr_fac in curr_facilities.items():
            prev_fac_name = next((old for old, new in facility_name_map.items() if new == fac_name), fac_name)
            prev_fac = prev_facilities.get(prev_fac_name, {})

            diff = DeepDiff(prev_fac, curr_fac, ignore_order=True, exclude_regex_paths=[r".*?id'\]$"])
            for path, old_val, new_val, ct in cls._parse_deepdiff_items(diff, prev_fac, curr_fac):
                normalized_path = path[4:] if path.startswith('root') else path
                full_path = f"root['facility_reports']['{fac_name}']{normalized_path}"
                changes.append(cls.process_change(full_path, old_val, new_val, ct, serialized_data=current))

        # 3. Top-level diff
        diff = DeepDiff(previous, current, ignore_order=True, exclude_regex_paths=[r".*?facility_reports.*"])
        for path, old_val, new_val, ct in cls._parse_deepdiff_items(diff, previous, current):
            changes.append(cls.process_change(path, old_val, new_val, ct, serialized_data=current))

        return changes
