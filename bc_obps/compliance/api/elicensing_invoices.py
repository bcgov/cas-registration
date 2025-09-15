from typing import List
from compliance.schema.elicensing_invoice import ElicensingInvoiceListOut
from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceReportVersion
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate, PageNumberPagination
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/elicensing-invoices",
    response={200: List[ElicensingInvoiceListOut], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all compliance report versions for the current user's operations",
    auth=authorize("approved_authorized_roles"),
)
@paginate(PageNumberPagination)
def get_elicensing_invoice_list(request: HttpRequest) -> QuerySet[ComplianceReportVersion]:
    user_guid = get_current_user_guid(request)
    # breakpoint()
    return ComplianceInvoiceService.get_elicensing_invoice_for_dashboard(user_guid)
