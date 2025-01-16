from typing import Literal, Tuple, List

from django.db.models import QuerySet

from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from registration.models import RegulatedProduct
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn
from service.report_service import ReportService
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.report_operation import ReportOperationIn, ReportOperationSchemaOut, ReportOperationOut
from reporting.schema.reporting_year import ReportingYearOut
from .router import router
from ..schema.report_regulated_products import RegulatedProductOut
from ..models import ReportingYear, ReportVersion, ReportOperationRepresentative
from ..schema.report_version import ReportingVersionOut


@router.post(
    "/create-report",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Starts a report for a given operation and reporting year, by creating the underlying data structures and
    pre-populating them with facility, operation and operator information. Returns the id of the report that was created.
    This endpoint only allows the creation of a report for an operation / operator to which the current user has access.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def start_report(request: HttpRequest, payload: StartReportIn) -> Tuple[Literal[201], int]:
    report_version_id = ReportService.create_report(payload.operation_id, payload.reporting_year)
    return 201, report_version_id


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_report_operation_by_version_id(request: HttpRequest, version_id: int) -> tuple[Literal[200], dict]:
    report_operation_representative = ReportOperationRepresentative.objects.filter(report_version__id=version_id)
    report_operation = ReportService.get_report_operation_by_version_id(version_id)
    return 200, {
        "report_operation": report_operation,
        "report_operation_representatives": report_operation_representative,
    }


@router.post(
    "/report-version/{version_id}/report-operation",
    response={201: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report(
    request: HttpRequest, version_id: int, payload: ReportOperationIn
) -> Tuple[Literal[201], ReportOperationOut]:
    report_operation = ReportService.save_report_operation(version_id, payload)
    return 201, report_operation  # type: ignore


@router.get(
    "/reporting-year",
    response={200: ReportingYearOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("all_roles"),
)
@handle_http_errors()
def get_reporting_year(request: HttpRequest) -> Tuple[Literal[200], ReportingYear]:
    return 200, ReportingYearService.get_current_reporting_year()


@router.get(
    "/report-version/{version_id}/report-operation/regulated-products",
    response={200: List[RegulatedProductOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves all regulated products associated with a report operation identified by its version ID.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_regulated_products_by_version_id(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], QuerySet[RegulatedProduct]]:
    regulated_products = ReportService.get_regulated_products_by_version_id(version_id)
    return 200, regulated_products


@router.get(
    "/report-version/{version_id}/report-type",
    response={200: ReportingVersionOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Retrieve the report type for a specific reporting version, including the reporting year and due date.",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_report_type_by_version(request: HttpRequest, version_id: int) -> tuple[Literal[200], ReportVersion]:
    report_type = ReportService.get_report_type_by_version_id(version_id)
    return 200, report_type
