from typing import Literal, Tuple
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.service.report_supplementary_version_service import ReportSupplementaryVersionService
from service.report_version_service import ReportVersionService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/is-supplementary-report-version",
    response={200: bool, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Checks if this is a supplementary report version or, not the initial version.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def is_supplementary_report_version(request: HttpRequest, version_id: int) -> Tuple[Literal[200], bool]:
    is_initial = ReportVersionService.is_initial_report_version(version_id)
    return 200, not is_initial


@router.post(
    "/report-version/{version_id}/create-report-supplementary-version",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Creates a new supplementary report version or a new report version based on registration purpose.

        This endpoint generates a new draft supplementary report version if the registration purpose has not changed.
        If the registration purpose has changed, it creates a new report version instead, ensuring the report reflects
        the updated purpose.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def create_report_supplementary_version(request: HttpRequest, version_id: int) -> Tuple[Literal[201], int]:
    new_version = ReportSupplementaryVersionService.create_or_clone_report_version(version_id)
    return 201, new_version.id
