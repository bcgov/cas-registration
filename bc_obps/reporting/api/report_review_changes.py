from deepdiff import DeepDiff
from typing import Literal
from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from ..models import (
    ReportVersion,
)
from ..schema.report_final_review import ReportVersionSchema
from .router import router
from service.report_version_service import  ReportVersionService


@router.get(
    "/report-version/{version_id}/diff-data",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch serialized data for the given report version and the latest previous version with the same report_id.",
)
def get_report_version_diff_data(request: HttpRequest, version_id: int) -> tuple[Literal[200], dict]:
    current_version = ReportVersionService.fetch_full_report_version(version_id)
    previous_version_id = (
        ReportVersion.objects.filter(report_id=current_version.report_id, id__lt=current_version.id)
        .order_by("-id")
        .values_list("id", flat=True)
        .first()
    )

    if not previous_version_id:
        return 200, {"message": "No previous report version found for the given report_id."}
    previous_version = ReportVersionService.fetch_full_report_version(previous_version_id)

    serialized_current = ReportVersionSchema.from_orm(current_version).dict()
    serialized_previous = ReportVersionSchema.from_orm(previous_version).dict()

    differences = DeepDiff(serialized_previous, serialized_current, ignore_order=True)

    changed = []
    for key, change in differences.get('values_changed', {}).items():
        changed.append({
            "field": key,
            "old_value": change.get('old_value'),
            "new_value": change.get('new_value'),
        })

    return 200, {
        "changed": changed
    }