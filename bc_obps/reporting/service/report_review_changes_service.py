from typing import Any, Dict, List, Optional, Tuple, TypedDict
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
        {
            'regex': re.compile(
                r"root\['facility_reports'\]\['([^']+)'\]\['report_emission_allocation'\]\['report_product_emission_allocations'\]\[(\d+)\]\['products'\]\[(\d+)\](.*)"
            ),
            'index_groups': [2, 3],  # allocation index, product index
            'root': 'facility_reports',
            'subkeys': ['report_emission_allocation', 'report_product_emission_allocations'],
            'name_key': 'product_name',
            'format': (
                "root['facility_reports']['{facility}']"
                "['report_emission_allocation']['report_product_emission_allocations']['{category_name}']"
                "['products']['{product_name}']{suffix}"
            ),
            'suffix_group': 4,
        },
        {
            'regex': re.compile(
                r"root\['facility_reports'\]\['([^']+)'\]\['report_emission_allocation'\]\['report_product_emission_allocations'\]\[(\d+)\](.*)"
            ),
            'index_groups': [2],  # allocation index only
            'root': 'facility_reports',
            'subkeys': ['report_emission_allocation', 'report_product_emission_allocations'],
            'name_key': 'emission_category_name',
            'format': (
                "root['facility_reports']['{facility}']"
                "['report_emission_allocation']['report_product_emission_allocations']['{category_name}']{suffix}"
            ),
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
    def _get_item_by_indexes(serialized_data: dict, root: str, subkeys: List[str], idxs: List[int]) -> Optional[dict]:
        """
        Safely get nested dict item by indexes.
        Returns None if any index or key is missing or final item is not a dict.
        """
        data = serialized_data.get(root)
        if data is None:
            return None

        for i, key in enumerate(subkeys):
            idx = idxs[i]
            if not isinstance(data, list) or idx >= len(data):
                return None
            data = data[idx].get(key)
            if data is None:
                return None

        # At this point, data should be a list, get the final index safely
        final_idx = idxs[-1]
        if isinstance(data, list):
            if final_idx < len(data):
                data = data[final_idx]
            else:
                return None

        # Only return dicts
        if isinstance(data, dict):
            return data
        return None

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
        if not match or not serialized_data:
            return path

        idxs = [int(match.group(i)) for i in config['index_groups']]
        suffix = match.group(config['suffix_group'])

        if "facility_reports" in config['root']:
            facility_name = match.group(1)
            allocations = serialized_data['facility_reports'][facility_name]['report_emission_allocation'][
                'report_product_emission_allocations'
            ]
            allocation = allocations[idxs[0]]
            category_name = allocation['emission_category_name'] or allocation['emission_category_id']

            # Build format parameters
            format_params = {
                'facility': facility_name,
                'category_name': category_name,
                'suffix': suffix,
            }

            # Add product name if this is allocation + product (2 indexes)
            if len(idxs) == 2:
                format_params['product_name'] = allocation['products'][idxs[1]]['product_name']

            return config['format'].format(**format_params)

        item = ReportReviewChangesService._get_item_by_indexes(serialized_data, config['root'], config['subkeys'], idxs)
        if item is None:
            return path
        name = item[config['name_key']]
        return config['format'].format(
            entrant_idx=idxs[0],
            name=name,
            suffix=suffix,
        )

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

        # replace top-level facility UUID with name if available
        if field.startswith("root['facility_reports']"):
            # Normalize facilities first
            facilities = serialized_data.get('facility_reports', {})
            if isinstance(facilities, list):
                facilities = {str(f.get("facility") or f.get("facility_name")): f for f in facilities}

            match = re.match(r"root\['facility_reports'\]\['([^']+)'\]", field)
            if match:
                fac_uuid = match.group(1)
                fac_data = facilities.get(fac_uuid)
                if fac_data and 'facility_name' in fac_data:
                    field = field.replace(f"['{fac_uuid}']", f"['{fac_data['facility_name']}']")

        old_val = cls._replace_emission_category(old_val)
        new_val = cls._replace_emission_category(new_val)

        return {
            "field": field,
            "old_value": old_val,
            "new_value": new_val,
            "change_type": change_type,
        }

    @staticmethod
    def _normalize_facilities(facilities: Any) -> Dict[str, dict]:
        """Normalize facility_reports value (list or dict) into a dict keyed by identifier (uuid or name)."""
        if isinstance(facilities, list):
            return {str(f.get('facility') or f.get('facility_name')): f for f in facilities if isinstance(f, dict)}
        if isinstance(facilities, dict):
            return facilities
        return {}

    @staticmethod
    def _build_uuid_map(facilities: Dict[str, dict]) -> Dict[str, str]:
        """Return a mapping of facility UUID -> facility key (name or key used in dict)."""
        uuid_map: Dict[str, str] = {}
        for key, fac in facilities.items():
            if isinstance(fac, dict):
                fac_uuid = fac.get('facility')
                if fac_uuid:
                    uuid_map[str(fac_uuid)] = key
        return uuid_map

    @classmethod
    def _detect_renames(
        cls, prev_facilities: Dict[str, dict], curr_facilities: Dict[str, dict]
    ) -> List[Dict[str, Any]]:
        """Detect facility renames (same uuid, different keys). Mutates prev_facilities to map to new keys for later diffs.
        Returns list of rename change dicts."""
        changes: List[Dict[str, Any]] = []
        prev_uuid_map = cls._build_uuid_map(prev_facilities)
        curr_uuid_map = cls._build_uuid_map(curr_facilities)

        shared = set(prev_uuid_map.keys()) & set(curr_uuid_map.keys())
        for uuid in shared:
            prev_key = prev_uuid_map[uuid]
            curr_key = curr_uuid_map[uuid]
            if prev_key != curr_key:
                changes.append(
                    {
                        "field": f"root['facility_reports']['{curr_key}']['facility_name']",
                        "old_value": prev_key,
                        "new_value": curr_key,
                        "change_type": 'modified',
                    }
                )
                # Ensure further comparisons run under the new key
                prev_fac = prev_facilities.pop(prev_key, None)
                if prev_fac is not None:
                    prev_facilities[curr_key] = prev_fac

        return changes

    @classmethod
    def get_report_version_diff_changes(cls, previous: dict, current: dict) -> List[Dict[str, Any]]:
        changes: List[Dict[str, Any]] = []

        previous = previous or {}
        current = current or {}

        # --- Registration purpose check ---
        prev_purpose = previous.get("report_operation", {}).get("registration_purpose")
        curr_purpose = current.get("report_operation", {}).get("registration_purpose")
        if prev_purpose != curr_purpose:
            changes.append(
                {
                    "field": "root['report_operation']['registration_purpose']",
                    "old_value": prev_purpose,
                    "new_value": curr_purpose,
                    "change_type": "modified",
                }
            )

        # --- Facility name changes / added / removed ---
        prev_facilities = cls._normalize_facilities(previous.get('facility_reports', []))
        curr_facilities = cls._normalize_facilities(current.get('facility_reports', []))

        # Detect renames first (mutates prev_facilities so we don't later mark as added/removed)
        changes.extend(cls._detect_renames(prev_facilities, curr_facilities))

        # Detect removed facilities
        for fac_name, prev_fac in list(prev_facilities.items()):
            if fac_name not in curr_facilities:
                changes.append(
                    {
                        "field": f"root['facility_reports']['{fac_name}']",
                        "old_value": prev_fac,
                        "new_value": None,
                        "change_type": "removed",
                    }
                )

        # Detect added facilities
        for fac_name, curr_fac in curr_facilities.items():
            if fac_name not in prev_facilities:
                changes.append(
                    {
                        "field": f"root['facility_reports']['{fac_name}']",
                        "old_value": None,
                        "new_value": curr_fac,
                        "change_type": "added",
                    }
                )

        # Detect modified facilities
        for fac_name, curr_fac in curr_facilities.items():
            if fac_name in prev_facilities:
                prev_fac = prev_facilities[fac_name]
                diff = DeepDiff(prev_fac, curr_fac, ignore_order=True, exclude_regex_paths=[r".*?id'\]$"])
                for item in cls._parse_deepdiff_items(diff, prev_fac, curr_fac):
                    normalized_path = item.path[4:] if item.path.startswith('root') else item.path
                    full_path = f"root['facility_reports']['{fac_name}']{normalized_path}"
                    changes.append(
                        cls.process_change(
                            full_path, item.old_value, item.new_value, item.change_type, serialized_data=current
                        )
                    )

        # --- Compliance products added/removed/modified ---
        prev_products = {
            p.get('name'): p
            for p in (previous.get('report_compliance_summary') or {}).get('products', [])
            if p.get('name')
        }
        curr_products = {
            p.get('name'): p
            for p in (current.get('report_compliance_summary') or {}).get('products', [])
            if p.get('name')
        }

        # Removed products
        for name in prev_products.keys() - curr_products.keys():
            changes.append(
                {
                    "field": f"root['report_compliance_summary']['products']['{name}']",
                    "old_value": prev_products[name],
                    "new_value": None,
                    "change_type": "removed",
                }
            )

        # Added products
        for name in curr_products.keys() - prev_products.keys():
            changes.append(
                {
                    "field": f"root['report_compliance_summary']['products']['{name}']",
                    "old_value": None,
                    "new_value": curr_products[name],
                    "change_type": "added",
                }
            )

        # Modified products
        for name in prev_products.keys() & curr_products.keys():
            prev_p = prev_products[name]
            curr_p = curr_products[name]
            diff = DeepDiff(prev_p, curr_p, ignore_order=True)
            for item in cls._parse_deepdiff_items(diff, prev_p, curr_p):
                # Keep the product name as key in path
                field = f"root['report_compliance_summary']['products']['{name}']{item.path[4:]}"
                changes.append(
                    cls.process_change(field, item.old_value, item.new_value, item.change_type, serialized_data=current)
                )

        # --- Top-level diff excluding facility_reports (products handled separately) ---
        diff = DeepDiff(previous, current, ignore_order=True, exclude_regex_paths=[r".*?facility_reports.*"])
        for item in cls._parse_deepdiff_items(diff, previous, current):
            # Skip products, already handled
            if item.path.startswith("root['report_compliance_summary']['products']"):
                continue
            changes.append(
                cls.process_change(item.path, item.old_value, item.new_value, item.change_type, serialized_data=current)
            )

        return changes
