from typing import List
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceReportVersion
from compliance.schema.compliance_report_version import ComplianceReportVersionListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE
from registration.utils import CustomPagination
from ninja import Query


@router.get(
    "/compliance-report-versions",
    response={200: List[ComplianceReportVersionListOut], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all compliance report versions for the current user's operations",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def get_compliance_report_versions_list(
    request: HttpRequest,
    paginate_result: bool = Query(False, description="Whether to paginate the results"),
) -> QuerySet[ComplianceReportVersion]:
    user_guid = get_current_user_guid(request)
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return ComplianceDashboardService.get_compliance_report_versions_for_dashboard(user_guid)
