import pprint
from uuid import UUID
from reporting.models.report_version import ReportVersion
from reporting.schema.report_sign_off import ReportSignOffIn
from common.api.utils.current_user_utils import get_current_user_guid
from django.http import HttpRequest
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
)
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.service.report_submission_service import ReportSubmissionService
from reporting.service.report_validation.validators.report_activity_json_validation import (
    validate,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{version_id}/submit",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Submits a report version""",
    auth=approved_industry_user_report_version_composite_auth,
)
def submit_report_version(
    request: HttpRequest, version_id: int, payload: ReportSignOffIn
) -> int:
    user_guid: UUID = get_current_user_guid(request)
    ReportSubmissionService.submit_report(version_id, user_guid, payload)
    return version_id


@router.get(
    "report-version/{version_id}/test",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""test""",
)
def test_validation(request: HttpRequest, version_id: int) -> int:
    report_version = ReportVersion.objects.get(id=version_id)
    result = validate(report_version)
    pprint.pprint(result, indent=2)
    return 200
