from typing import List
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceReportVersion
from compliance.schema.compliance_report_version import ComplianceReportVersionListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate, PageNumberPagination
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/compliance-report-versions",
    response={200: List[ComplianceReportVersionListOut], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all compliance report versions for the current user's operations",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_compliance_report_versions_list(request: HttpRequest) -> QuerySet[ComplianceReportVersion]:
    user_guid = get_current_user_guid(request)
    return ComplianceDashboardService.get_compliance_report_versions_for_dashboard(user_guid)
