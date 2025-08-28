import re
from typing import Any, Dict, List, Optional, Tuple, Union
from deepdiff import DeepDiff
import logging

logger = logging.getLogger(__name__)


class ReportReviewChangesService:
    # Configs for index-to-name replacement
    CONFIGS: List[Dict[str, Any]] = [
        {
            'regex': r"root\['report_compliance_summary'\]\['products'\]\[(\d+)\](.*)",
            'index_groups': [1],
            'root': 'report_compliance_summary',
            'subkeys': ['products'],
            'name_key': 'product_name',
            'format': "root['report_compliance_summary']['products']['{name}']{suffix}",
            'suffix_group': 2,
        },
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
    def get_value_by_path(obj: dict, path_str: str) -> Any:
        """
        Traverses a nested dictionary using a string path and returns the value at that path.
        Example path_str: "root['facility_reports'][0]['facility_name']"
        """
        keys = re.findall(r"\[(?:'([^']+)'|(\d+))\]", path_str)
        val: Any = obj
        for string_key, numeric_key in keys:
            val = val[string_key if string_key else int(numeric_key)]
        return val

    @staticmethod
    def _get_item_by_indexes(
        serialized_data: dict, root: str, subkeys: List[str], idxs: List[int]
    ) -> Optional[Union[dict, Any]]:
        """
        Retrieves an item from serialized_data using root, subkeys, and index list.
        Used for index-to-name replacement in diff paths.
        """
        data = serialized_data.get(root, [])
        for i, key in enumerate(subkeys):
            if idxs[i] < len(data):
                data = data[idxs[i]].get(key, [])
            else:
                return None
        if isinstance(data, dict):
            return data
        return data[idxs[-1]] if idxs[-1] < len(data) else None

    @staticmethod
    def _replace_index_with_name(path: str, serialized_data: dict, config: dict) -> str:
        """
        Replaces numeric indexes in a diff path with human-readable names using config rules.
        Always returns a string.
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

    @staticmethod
    def _replace_emission_category(val: Any) -> Any:
        """
        If val is a dict with 'emission_category_id' and 'emission_category_name',
        replaces 'emission_category_id' with the value of 'emission_category_name'.
        Returns the updated value.
        """
        if isinstance(val, dict):
            if 'emission_category_id' in val and 'emission_category_name' in val:
                val = val.copy()
                val['emission_category_id'] = val['emission_category_name']
        return val

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
        Processes a diff change and returns a dict with a human-readable field path and values.
        Uses index-to-name replacement for supported field types and handles emission category renaming.
        """
        if serialized_data is None:
            serialized_data = {}

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

    @classmethod
    def get_report_version_diff_changes(cls, previous_data: dict, current_data: dict) -> List[Dict[str, Any]]:
        """
        Compares previous and current report data using DeepDiff, filters out irrelevant changes,
        and returns a list of processed changes with human-readable field names and values.
        """
        differences = DeepDiff(
            previous_data,
            current_data,
            ignore_order=True,
            exclude_regex_paths=[
                r".*?id'\]$",
                r"root\['report_person_responsible'\]\['report_version'\]",
                r"root\['id'\]",
            ],
        )

        changed: List[Dict[str, Any]] = []

        def extract_values(
            path: str, change: Any, old_data: dict, new_data: dict, typ: str
        ) -> Tuple[Any, Any, Optional[str]]:
            """
            Helper to extract old and new values for a diff change depending on change type.
            """
            if typ == 'values_changed':
                return (
                    getattr(change, 'old_value', change.get('old_value')),
                    getattr(change, 'new_value', change.get('new_value')),
                    'modified',
                )
            elif typ == 'type_changes':
                old_val = change.get('old_value')
                new_val = change.get('new_value')
                change_type_str = 'added' if old_val is None and new_val is not None else 'modified'
                return old_val, new_val, change_type_str
            elif typ.endswith('added'):
                val = change or cls.get_value_by_path(new_data, path)
                return (None, val, 'added')
            elif typ.endswith('removed'):
                val = change or cls.get_value_by_path(old_data, path)
                return (val, None, 'removed')
            return (None, None, None)

        for change_type, changes_dict in differences.items():
            # DeepDiff returns a dict for most change types, but for some (like iterable_item_added/removed),
            # it returns a list of paths. This line ensures we can iterate over both dict and list results.
            items = changes_dict.items() if isinstance(changes_dict, dict) else [(path, None) for path in changes_dict]
            for path, change_data in items:
                try:
                    old_val, new_val, change_type_str = extract_values(
                        path, change_data, previous_data, current_data, change_type
                    )
                    changed.append(cls.process_change(path, old_val, new_val, change_type_str or '', current_data))
                except (KeyError, IndexError, TypeError) as e:
                    logger.debug(f"Skipping change due to error: {e}, path: {path}")
                    continue
        return changed
