from typing import List, Literal, Tuple
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from common.permissions import authorize
from registration.decorators import handle_http_errors
from compliance.models import ComplianceSummary
from compliance.schema.compliance_summary import ComplianceSummaryOut, ComplianceSummaryListOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router


@router.get(
    "/summaries",
    response={200: List[ComplianceSummaryListOut]},
    tags=["Compliance"],
    description="Get all compliance summaries for the current user's operations",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_compliance_summaries(request: HttpRequest) -> Tuple[Literal[200], List[ComplianceSummary]]:
    """Get all compliance summaries for the current user's operations"""
    summaries = ComplianceSummary.objects.select_related(
        'report',
        'report__operation',
        'compliance_period'
    ).filter(
        report__operation__user_operators__user_id=request.user.id,
        report__operation__user_operators__status='Approved'
    ).order_by('-compliance_period__end_date', 'report__operation__name')

    return 200, summaries


@router.get(
    "/summaries/{summary_id}",
    response={200: ComplianceSummaryOut, custom_codes_4xx: str},
    tags=["Compliance"],
    description="Get a compliance summary by ID",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_compliance_summary(request: HttpRequest, summary_id: int) -> Tuple[Literal[200], ComplianceSummary]:
    """Get a compliance summary by ID"""
    summary = get_object_or_404(
        ComplianceSummary.objects.select_related(
            'report',
            'report__operation',
            'current_report_version',
            'compliance_period'
        ).filter(
            report__operation__user_operators__user_id=request.user.id,
            report__operation__user_operators__status='Approved'
        ),
        id=summary_id
    )

    return 200, summary 
