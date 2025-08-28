from django.http import HttpRequest

from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from ..models import ReportVersion
from ..schema.report_final_review import ReportVersionSchema
from .router import router
from service.report_version_service import ReportVersionService
from reporting.service.report_review_changes_service import ReportReviewChangesService


@router.get(
    "/report-version/{version_id}/diff-data",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch serialized data for the given report version and its latest previous version for the same report_id.",
    # auth=approved_industry_user_report_version_composite_auth,
)
def get_report_version_diff_data(request: HttpRequest, version_id: int) -> tuple[int, dict]:
    """
    Returns the diff data between the given report version and the latest previous version for the same report_id.
    The compare_version_id parameter is removed; this endpoint only compares with the latest previous version.
    """
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
    current_data = ReportVersionSchema.from_orm(current_version).dict()
    previous_data = ReportVersionSchema.from_orm(previous_version).dict()

    changed = ReportReviewChangesService.get_report_version_diff_changes(previous_data, current_data)

    return 200, {"changed": changed}
