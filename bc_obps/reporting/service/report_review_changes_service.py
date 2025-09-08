from typing import Any, Dict, List, Optional, Union, Tuple, TypedDict
from deepdiff import DeepDiff
import logging
import re
from collections import namedtuple

logger = logging.getLogger(__name__)

ChangeItem = namedtuple('ChangeItem', ['path', 'old_value', 'new_value', 'change_type'])


class ReplaceIndexConfig(TypedDict):
    regex: re.Pattern[str]
    index_groups: List[int]
    root: str
    subkeys: List[str]
    name_key: str
    suffix_group: int
    format: str


class ComplianceConfig(TypedDict):
    regex: re.Pattern
    index_group: int
    suffix_group: int
    name_key: str
    format: str


class ReportReviewChangesService:
    """
    Service to process report version differences.
    Provides:
    - Index-to-name replacement in nested report structures
    - Emission category ID-to-name replacement
    - Special handling for facility_reports
    - Human-readable diff change outputs
    """

    CONFIGS: List[ReplaceIndexConfig] = [
        {
            'regex': re.compile(r"root\['report_new_entrant'\]\[(\d+)\]\['productions'\]\[(\d+)\](.*)"),
            'index_groups': [1, 2],
            'root': 'report_new_entrant',
            'subkeys': ['productions'],
            'name_key': 'product',
            'format': "root['report_new_entrant'][{entrant_idx}]['productions']['{name}']{suffix}",
            'suffix_group': 3,
        },
        {
            'regex': re.compile(r"root\['report_new_entrant'\]\[(\d+)\]\['report_new_entrant_emission'\]\[(\d+)\](.*)"),
            'index_groups': [1, 2],
            'root': 'report_new_entrant',
            'subkeys': ['report_new_entrant_emission'],
            'name_key': 'emission_category',
            'format': "root['report_new_entrant'][{entrant_idx}]['report_new_entrant_emission']['{name}']{suffix}",
            'suffix_group': 3,
        },
    ]

    COMPLIANCE_CONFIG: ComplianceConfig = {
        'regex': re.compile(r"root\['report_compliance_summary'\]\['products'\]\[(\d+)\](.*)"),
        'index_group': 1,
        'name_key': 'name',
        'format': "root['report_compliance_summary']['products']['{name}']{suffix}",
        'suffix_group': 2,
    }

    @staticmethod
    def _replace_emission_category(val: Any) -> Any:
        if isinstance(val, dict) and 'emission_category_id' in val and 'emission_category_name' in val:
            val = val.copy()
            val['emission_category_id'] = val['emission_category_name']
        return val

    @staticmethod
    def get_value_by_path(obj: dict, path_str: str) -> Any:
        keys = re.findall(r"\[(?:'([^']+)'|(\d+))\]", path_str)
        for string_key, numeric_key in keys:
            obj = obj[string_key if string_key else int(numeric_key)]
        return obj

    @staticmethod
    def _get_item_by_indexes(
        serialized_data: dict, root: str, subkeys: List[str], idxs: List[int]
    ) -> Optional[Union[dict, Any]]:
        data = serialized_data.get(root, [])
        for i, key in enumerate(subkeys):
            if idxs[i] >= len(data):
                return None
            data = data[idxs[i]].get(key, [])
        return data[idxs[-1]] if isinstance(data, list) else data

    @classmethod
    def _parse_deepdiff_items(cls, diff: DeepDiff, prev: dict, curr: dict) -> List[ChangeItem]:
        results = []
        for change_type, items in diff.items():
            if isinstance(items, dict):
                items = list(items.items())
            else:
                items = [(path, None) for path in items]

            for path, change_data in items:
                old_val, new_val, ct = cls._extract_diff_values(path, change_data, prev, curr, change_type)
                results.append(ChangeItem(path, old_val, new_val, ct))

        return results

    @staticmethod
    def _extract_diff_values(path: str, change: Any, old_data: dict, new_data: dict, typ: str) -> Tuple[Any, Any, str]:
        """
        Extract old and new values for a DeepDiff change depending on type.
        Returns a tuple: (old_value, new_value, change_type)
        """
        old_val, new_val, change_type = None, None, 'modified'

        if typ == 'values_changed':
            old_val = getattr(change, 'old_value', None) or change.get('old_value')
            new_val = getattr(change, 'new_value', None) or change.get('new_value')
            change_type = 'modified'
        elif typ in ['dictionary_item_added', 'iterable_item_added'] or typ.endswith('added'):
            new_val = change or ReportReviewChangesService.get_value_by_path(new_data, path)
            change_type = 'added'
        elif typ in ['dictionary_item_removed', 'iterable_item_removed'] or typ.endswith('removed'):
            old_val = change or ReportReviewChangesService.get_value_by_path(old_data, path)
            change_type = 'removed'
        elif typ == 'type_changes':
            old_val = getattr(change, 'old_value', None) or change.get('old_value')
            new_val = getattr(change, 'new_value', None) or change.get('new_value')
            change_type = 'modified'

        return old_val, new_val, change_type

    @staticmethod
    def _replace_index_with_name(path: str, serialized_data: dict, config: ReplaceIndexConfig) -> str:
        match = config['regex'].match(path)
        if match and serialized_data:
            idxs = [int(match.group(i)) for i in config['index_groups']]
            item = ReportReviewChangesService._get_item_by_indexes(
                serialized_data, config['root'], config['subkeys'], idxs
            )
            if item:
                name = item.get(config['name_key'])
                if isinstance(name, str):
                    return config['format'].format(
                        entrant_idx=idxs[0],
                        name=name,
                        suffix=match.group(config['suffix_group']),
                    )
        return path

    @classmethod
    def _replace_compliance_product_index(cls, path: str, serialized_data: dict) -> str:
        match = cls.COMPLIANCE_CONFIG['regex'].match(path)
        if match and serialized_data:
            idx = int(match.group(cls.COMPLIANCE_CONFIG['index_group']))
            suffix = match.group(cls.COMPLIANCE_CONFIG['suffix_group'])
            products = serialized_data.get('report_compliance_summary', {}).get('products', [])
            if idx < len(products):
                name = products[idx].get(cls.COMPLIANCE_CONFIG['name_key'])
                if isinstance(name, str):  # <-- type-safe check
                    return cls.COMPLIANCE_CONFIG['format'].format(name=name, suffix=suffix)
        return path

    @classmethod
    def process_change(
        cls, path: str, old_val: Any, new_val: Any, change_type: str, serialized_data: Optional[dict] = None
    ) -> Dict[str, Any]:
        serialized_data = serialized_data or {}
        # Try existing configs
        field = path
        for config in cls.CONFIGS:
            new_field = cls._replace_index_with_name(path, serialized_data, config)
            if new_field != path:
                field = new_field
                break
        # Then compliance mapping
        field = cls._replace_compliance_product_index(field, serialized_data)

        old_val = cls._replace_emission_category(old_val)
        new_val = cls._replace_emission_category(new_val)
        return {
            "field": field,
            "old_value": old_val,
            "new_value": new_val,
            "change_type": change_type,
        }

    @classmethod
    def get_report_version_diff_changes(cls, previous: dict, current: dict) -> List[Dict[str, Any]]:
        changes: List[Dict[str, Any]] = []

        # --- Facility name changes ---
        prev_facilities = previous.get("facility_reports", {})
        curr_facilities = current.get("facility_reports", {})
        facility_name_map: Dict[str, str] = {}

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

        # --- Nested facility reports ---
        for fac_name, curr_fac in curr_facilities.items():
            prev_fac_name = next((old for old, new in facility_name_map.items() if new == fac_name), fac_name)
            prev_fac = prev_facilities.get(prev_fac_name, {})

            diff = DeepDiff(prev_fac, curr_fac, ignore_order=True, exclude_regex_paths=[r".*?id'\]$"])
            for item in cls._parse_deepdiff_items(diff, prev_fac, curr_fac):
                normalized_path = item.path[4:] if item.path.startswith('root') else item.path
                full_path = f"root['facility_reports']['{fac_name}']{normalized_path}"
                changes.append(
                    cls.process_change(
                        full_path, item.old_value, item.new_value, item.change_type, serialized_data=current
                    )
                )

        # --- Top-level diff ---
        diff = DeepDiff(previous, current, ignore_order=True, exclude_regex_paths=[r".*?facility_reports.*"])
        for item in cls._parse_deepdiff_items(diff, previous, current):
            changes.append(
                cls.process_change(item.path, item.old_value, item.new_value, item.change_type, serialized_data=current)
            )

        return changes
