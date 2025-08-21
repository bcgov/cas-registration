from compliance.models.compliance_obligation import ComplianceObligation
from compliance.schema.obligation_tasklist import TasklistOut
from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from service.reporting_year_service import ReportingYearService
from compliance.api.router import router
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/obligation-tasklist",
    response={200: TasklistOut, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Get the data needed to build the tasklist for a compliance report version with an obligation",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def get_obligation_tasklist_data(
    request: HttpRequest,
    compliance_report_version_id: int,
) -> dict:
    obligation = ComplianceObligation.objects.only(
        'compliance_report_version__status', 'penalty_status', 'elicensing_invoice__outstanding_balance'
    ).get(compliance_report_version_id=compliance_report_version_id)
    reporting_year = ReportingYearService.get_current_reporting_year()
    return {
        "status": obligation.compliance_report_version.status,
        "penalty_status": obligation.penalty_status,
        "outstanding_balance": obligation.elicensing_invoice.outstanding_balance
        if obligation.elicensing_invoice
        else None,
        "reporting_year": reporting_year.reporting_year,
    }
