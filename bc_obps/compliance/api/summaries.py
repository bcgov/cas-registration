from typing import List
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from compliance.models import ComplianceSummary
<<<<<<< HEAD
from compliance.schema.compliance_summary import ComplianceSummaryOut, ComplianceSummaryListOut
from compliance.schema.payments import PaymentsListOut, PaymentOut
=======
from compliance.schema.compliance_summary import ComplianceSummaryListOut
>>>>>>> 91cbf10e0 (chore: check)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate, PageNumberPagination
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from registration.schema.generic import Message
from .router import router


@router.get(
    "/summaries",
    response={200: List[ComplianceSummaryListOut], custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get all compliance summaries for the current user's operations",
    auth=authorize("approved_industry_user"),
)
@paginate(PageNumberPagination)
def get_compliance_summaries_list(request: HttpRequest) -> QuerySet[ComplianceSummary]:
    """Get all compliance summaries for the current user's operations"""
    user_guid = get_current_user_guid(request)
    return ComplianceDashboardService.get_compliance_summaries_for_dashboard(user_guid)


@router.get(
    "/summaries/{summary_id}",
    response={200: Optional[ComplianceSummaryOut], custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get a compliance summary by ID",
    auth=authorize("approved_industry_user"),
)
def get_compliance_summary(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], Optional[ComplianceSummary]]:
    """Get a compliance summary by ID"""
    user_guid = get_current_user_guid(request)
    summary = ComplianceDashboardService.get_compliance_summary_by_id(user_guid, summary_id)
    return 200, summary


@router.get(
    "/summaries/{summary_id}/payments",
    response={200: PaymentsListOut, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get payments for a compliance summary's obligation",
    auth=authorize("approved_industry_user"),
)
def get_compliance_summary_payments(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], PaymentsListOut]:
    """Get payments for a compliance summary's obligation invoice"""
    user_guid = get_current_user_guid(request)
    payments = ComplianceDashboardService.get_compliance_summary_payments(user_guid, summary_id)

    # Convert dictionary payments to PaymentOut objects
    payment_objects = [PaymentOut(**payment) for payment in payments]

    response = PaymentsListOut(rows=payment_objects, row_count=len(payment_objects))

    return 200, response
# Note: POST endpoint for creating a new summary would be added here when needed
