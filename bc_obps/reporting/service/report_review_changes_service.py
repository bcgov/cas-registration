import re
from typing import Any, Dict, List, Optional, Tuple, Union
from deepdiff import DeepDiff
import logging

logger = logging.getLogger(__name__)


class ReportReviewChangesService:
    """
    Service to process report version differences.
    Provides:
    - Index-to-name replacement in nested report structures
    - Emission category ID-to-name replacement
    - Special handling for facility_reports
    - Human-readable diff change outputs
    """

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

    @staticmethod
    def _replace_emission_category(val: Any) -> Any:
        """
        If dict contains 'emission_category_id' and 'emission_category_name',
        replaces 'emission_category_id' with the name.
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

    @classmethod
    def get_report_version_diff_changes(cls, previous_data: dict, current_data: dict) -> List[Dict[str, Any]]:
        """
        Compare previous and current report data using DeepDiff.
        Handles facility_reports specially and returns a list of human-readable changes.
        """
        changed: List[Dict[str, Any]] = []

        # --- If registration_purpose changed ---
        prev_purpose = previous_data.get("report_operation", {}).get("registration_purpose")
        curr_purpose = current_data.get("report_operation", {}).get("registration_purpose")
        if prev_purpose != curr_purpose:
            return [
                {
                    "field": "root['report_operation']['registration_purpose']",
                    "old_value": prev_purpose,
                    "new_value": curr_purpose,
                    "change_type": "modified",
                }
            ]

        # --- Special handling for facility_reports ---
        if "facility_reports" in previous_data and "facility_reports" in current_data:
            old_facilities = previous_data["facility_reports"]
            new_facilities = current_data["facility_reports"]

            removed_keys = set(old_facilities.keys()) - set(new_facilities.keys())
            added_keys = set(new_facilities.keys()) - set(old_facilities.keys())

            for old_key in removed_keys:
                old_fac = old_facilities[old_key]
                for new_key in added_keys.copy():
                    new_fac = new_facilities[new_key]
                    if old_fac.get("facility") == new_fac.get("facility"):
                        facility_name_new = new_fac.get("facility_name") or new_key
                        other_old = {k: v for k, v in old_fac.items() if k != "facility_name"}
                        other_new = {k: v for k, v in new_fac.items() if k != "facility_name"}

                        if other_old == other_new:
                            changed.append(
                                {
                                    "field": f"root['facility_reports']['{facility_name_new}']['facility_name']",
                                    "old_value": old_fac.get("facility_name"),
                                    "new_value": new_fac.get("facility_name"),
                                    "change_type": "modified",
                                }
                            )
                        else:
                            differences = DeepDiff(
                                old_fac,
                                new_fac,
                                ignore_order=True,
                                exclude_regex_paths=[r".*?id'\]$"],
                            )
                            for change_type, changes_dict in differences.items():
                                if isinstance(changes_dict, dict):
                                    facility_items: List[Tuple[Any, Any]] = list(changes_dict.items())
                                else:
                                    facility_items = [(path, None) for path in changes_dict]

                                for path, change_data in facility_items:
                                    try:
                                        old_val, new_val, change_type_str = cls._extract_diff_values(
                                            path, change_data, old_fac, new_fac, change_type
                                        )
                                        processed = cls.process_change(
                                            path, old_val, new_val, change_type_str or '', new_fac
                                        )
                                        processed[
                                            "field"
                                        ] = f"root['facility_reports']['{facility_name_new}']{processed['field'][4:]}"
                                        changed.append(processed)
                                    except (KeyError, IndexError, TypeError) as e:
                                        logger.debug(f"Skipping facility change due to error: {e}, path: {path}")
                                        continue

                        added_keys.remove(new_key)
                        break

            for old_key in removed_keys:
                previous_data["facility_reports"].pop(old_key, None)
            for new_key in set(new_facilities.keys()) - added_keys:
                current_data["facility_reports"].pop(new_key, None)

        # --- General DeepDiff for remaining data ---
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

        for change_type, changes_dict in differences.items():
            if isinstance(changes_dict, dict):
                items: List[Tuple[Any, Any]] = list(changes_dict.items())
            else:
                items = [(path, None) for path in changes_dict]

            for path, change_data in items:
                try:
                    old_val, new_val, change_type_str = cls._extract_diff_values(
                        path, change_data, previous_data, current_data, change_type
                    )
                    changed.append(cls.process_change(path, old_val, new_val, change_type_str or '', current_data))
                except (KeyError, IndexError, TypeError) as e:
                    logger.debug(f"Skipping change due to error: {e}, path: {path}")
                    continue

        return changed

    @staticmethod
    def _extract_diff_values(
        path: str, change: Any, old_data: dict, new_data: dict, typ: str
    ) -> Tuple[Any, Any, Optional[str]]:
        """
        Extract old and new values for a DeepDiff change depending on type.
        Returns a tuple: (old_value, new_value, change_type)
        """
        if typ == 'values_changed':
            old_val = change.get('old_value')
            new_val = change.get('new_value')
            return old_val, new_val, 'modified'
        elif typ == 'type_changes':
            old_val = change.get('old_value')
            new_val = change.get('new_value')
            change_type_str = 'added' if old_val is None and new_val is not None else 'modified'
            return old_val, new_val, change_type_str
        elif typ.endswith('added'):
            val = change or ReportReviewChangesService.get_value_by_path(new_data, path)
            return None, val, 'added'
        elif typ.endswith('removed'):
            val = change or ReportReviewChangesService.get_value_by_path(old_data, path)
            return val, None, 'removed'
        return None, None, None
