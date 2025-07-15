from deepdiff import DeepDiff  # type: ignore
from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from .permissions import approved_industry_user_report_version_composite_auth
from ..models import ReportVersion
from ..schema.report_final_review import ReportVersionSchema
from .router import router
from service.report_version_service import ReportVersionService
import re


def get_value_by_path(obj: dict, path_str: str) -> object:
    """Extract value from nested dict/list using DeepDiff path."""
    keys = re.findall(r"\[(?:'([^']+)'|(\d+))\]", path_str)
    val = obj
    for string_key, numeric_key in keys:
        val = val[string_key if string_key else int(numeric_key)]
    return val


def process_change(path: str, old_val: object, new_val: object, change_type: str) -> dict:
    """Process a single change and return formatted change dict."""
    return {
        "field": path,
        "old_value": old_val,
        "new_value": new_val,
        "change_type": change_type,
    }


@router.get(
    "/report-version/{version_id}/diff-data",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch serialized data for the given report version and the latest previous version with the same report_id.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_version_diff_data(
    request: HttpRequest, version_id: int, compare_version_id: int | None = None
) -> tuple[int, dict]:
    current_version = ReportVersionService.fetch_full_report_version(version_id)

    previous_version_id: int | None
    if compare_version_id is not None:
        previous_version_id = compare_version_id
    else:
        previous_version_id = (
            ReportVersion.objects.filter(report_id=current_version.report_id, id__lt=current_version.id)
            .order_by("-id")
            .values_list("id", flat=True)
            .first()
        )

    if previous_version_id is None:
        return 200, {"message": "No previous report version found for the given report_id."}

    # Get both versions and serialize
    previous_version = ReportVersionService.fetch_full_report_version(previous_version_id)
    current_data = ReportVersionSchema.from_orm(current_version).dict()
    previous_data = ReportVersionSchema.from_orm(previous_version).dict()

    # Calculate differences
    differences = DeepDiff(
        previous_data,
        current_data,
        ignore_order=True,
        exclude_regex_paths=[
            r".*?id\'\]$",
            r"root\[\'report_person_responsible\'\]\[\'report_version\'\]",
            r"root\[\'id\'\]",
            r"root\[\'facility_reports\'\].*\[\'facility_name\'\]$",
        ],
    )

    # Filter out facility_reports changes that are only due to name changes
    if "values_changed" in differences and "root['facility_reports']" in differences["values_changed"]:
        try:
            old_facilities = list(differences["values_changed"]["root['facility_reports']"]["old_value"].values())
            new_facilities = list(differences["values_changed"]["root['facility_reports']"]["new_value"].values())

            if (
                len(old_facilities) == len(new_facilities)
                and old_facilities
                and all(
                    {k: v for k, v in old.items() if k != 'facility_name'}
                    == {k: v for k, v in new.items() if k != 'facility_name'}
                    for old, new in zip(old_facilities, new_facilities)
                )
            ):
                del differences["values_changed"]["root['facility_reports']"]
        except (KeyError, AttributeError, TypeError):
            pass

    changed = []

    change_handlers = {
        'values_changed': lambda path, change: (
            getattr(change, 'old_value', change.get('old_value')),
            getattr(change, 'new_value', change.get('new_value')),
            "modified",
        ),
        'dictionary_item_added': lambda path, val: (None, val or get_value_by_path(current_data, path), "added"),
        'iterable_item_added': lambda path, val: (None, val or get_value_by_path(current_data, path), "added"),
        'dictionary_item_removed': lambda path, val: (val or get_value_by_path(previous_data, path), None, "removed"),
        'iterable_item_removed': lambda path, val: (val or get_value_by_path(previous_data, path), None, "removed"),
    }

    for change_type, changes_dict in differences.items():
        if change_type not in change_handlers:
            continue

        handler = change_handlers[change_type]
        items = changes_dict.items() if isinstance(changes_dict, dict) else [(path, None) for path in changes_dict]

        for path, change_data in items:
            old_val, new_val, change_type_str = handler(path, change_data)
            changed.append(process_change(path, old_val, new_val, change_type_str))

    return 200, {"changed": changed}
