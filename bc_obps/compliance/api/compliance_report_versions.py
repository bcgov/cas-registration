from typing import List, Literal, Optional

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.constants import COMPLIANCE
from compliance.models import ComplianceReportVersion
from compliance.schema.compliance_report_version import (
    ComplianceReportVersionFilterSchema,
    ComplianceReportVersionListOut,
)
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from registration.schema.generic import Message
from registration.utils import CustomPagination

from .router import router


@router.get(
    "/compliance-report-versions",
    response={200: list[ComplianceReportVersionListOut], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all compliance report versions for the current user's operations",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def get_compliance_report_versions_list(
    request: HttpRequest,
    filters: ComplianceReportVersionFilterSchema = Query(...),
    sort_field: str | None = "operation_name",
    sort_order: Literal["desc", "asc"] | None = "asc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[ComplianceReportVersion]:
    """
    List compliance report versions for the current user's operations.
    """
    user_guid = get_current_user_guid(request)
    return ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
        user_guid, sort_field=sort_field, sort_order=sort_order, filters=filters
    )
