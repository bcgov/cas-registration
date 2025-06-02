from typing import Literal

from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx

from .router import router
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
    approved_authorized_roles_report_version_composite_auth,
)
from ..schema.report_operation import ReportOperationDataSchema, ReportOperationSchemaOut
from ..service.report_operation_service import ReportOperationService


def should_show(purpose: str, excluded_purposes: list) -> bool:
    return purpose not in excluded_purposes


@router.get(
    "/report-version/{version_id}/report-operation-data",
    response={200: ReportOperationDataSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Returns report operation data for a given report version ID.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_operation_data(request: HttpRequest, version_id: int) -> dict:
    return ReportOperationService.get_report_operation_data_by_version_id(version_id)


@router.get(
    "/report-version/{version_id}/report-operation/update",
    response={200: ReportOperationDataSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Updates the facility report details by version_id and facility_id.",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_update_report(request: HttpRequest, version_id: int) -> tuple[Literal[200], dict]:
    report_operation = ReportOperationService.update_report_operation(version_id)
    return 200, report_operation


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_report_operation_by_version_id(request: HttpRequest, version_id: int) -> dict:
    return ReportOperationService.get_report_operation_by_version_id(version_id)
