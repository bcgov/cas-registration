from django.http import HttpRequest
from ninja import Status
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.report_service import ReportService

from .router import router
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
    approved_authorized_roles_report_version_composite_auth,
)
from ..schema.report_operation import (
    ReportOperationDataSchema,
    ReportOperationIn,
    ReportOperationOut,
    ReportOperationSchemaOut,
)
from ..service.report_operation_service import ReportOperationService
from ..service.sync_validation_service import SyncValidationService

"""
GET methods
"""


@router.get(
    "/report-version/{version_id}/report-operation-data",
    response={200: ReportOperationDataSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Returns report operation data for a given report version ID.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_operation_data(request: HttpRequest, version_id: int) -> Status:
    return Status(200, ReportOperationService.get_report_operation_data_by_version_id(version_id))


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_report_operation_by_version_id(request: HttpRequest, version_id: int) -> Status:
    return Status(200, ReportOperationService.get_report_operation_by_version_id(version_id))


"""
PATCH methods
"""


@router.patch(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationDataSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Updates the facility report details by version_id and facility_id.",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_update_report(request: HttpRequest, version_id: int) -> Status:
    # Validate that sync is allowed before proceeding
    if not SyncValidationService.is_sync_allowed(version_id):
        return Status(
            403,
            {
                "message": "Sync is not allowed for reports from previous reporting years or when operation ownership has been transferred"
            },
        )

    report_operation = ReportOperationService.update_report_operation(version_id)
    return Status(200, report_operation)


"""
POST methods
"""


@router.post(
    "/report-version/{version_id}/report-operation",
    response={201: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report(request: HttpRequest, version_id: int, payload: ReportOperationIn) -> Status:
    report_operation = ReportService.save_report_operation(version_id, payload)
    return Status(201, report_operation)
