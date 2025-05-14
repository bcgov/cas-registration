# # To be handled in issue #117


# from typing import Tuple, Union
# from django.http import HttpRequest
# from common.permissions import authorize
# from common.api.utils import get_current_user_guid
# from compliance.models import ComplianceReportVersion
# from bc_obps.compliance.schema.compliance_report_version import ComplianceReportVersionIssuanceOut
# from service.error_service.custom_codes_4xx import custom_codes_4xx
# from compliance.service.compliance_dashboard_service import ComplianceDashboardService
# from registration.schema.generic import Message
# from ...router import router


# @router.get(
#     "/compliance-report-version/{compliance_report_version_id}/issuance",
#     response={200: ComplianceReportVersionIssuanceOut, 404: Message, custom_codes_4xx: Message},
#     tags=["Compliance"],
#     description="Get issuance data for a compliance report version",
#     auth=authorize("approved_industry_user"),
# )
# def get_compliance_report_version_issuance(
#     request: HttpRequest, compliance_report_version_id: int
# ) -> Tuple[int, Union[ComplianceReportVersion, Message]]:
#     """Get issuance data for a compliance report version"""
#     user_guid = get_current_user_guid(request)
#     compliance_report_version = ComplianceDashboardService.get_compliance_compliance_report_version_issuance_data(user_guid, compliance_report_version_id)
#     if not compliance_report_version:
#         return 404, Message(message="Not Found")
#     return 200, compliance_report_version
