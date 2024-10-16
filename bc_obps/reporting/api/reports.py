from typing import Literal, Tuple, Optional

from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn
from service.report_service import ReportService
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.report_operation import ReportOperationOut, ReportOperationIn
from reporting.schema.reporting_year import ReportingYearOut
from .router import router
from ..models import ReportingYear
from ..schema.report_contact import ReportPersonResponsibleIn, ReportPersonResponsibleOut


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
    response={200: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_report_operation_by_version_id(
    request: HttpRequest, version_id: int
) -> Tuple[Literal[200], ReportOperationOut]:
    report_operation = ReportService.get_report_operation_by_version_id(version_id)
    return 200, report_operation  # type: ignore


@router.post(
    "/report-version/{version_id}/report-operation",
    response={201: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=authorize("approved_authorized_roles"),
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
    "/report-version/{version_id}/person-responsible",
    response={200: ReportPersonResponsibleOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_report_person_responsible_by_version_id(
    request: HttpRequest, version_id: int
) -> Tuple[Literal[200], ReportPersonResponsibleOut]:
    report_person_responsible = ReportService.get_report_person_responsible_by_version_id(version_id)
    return 200, report_person_responsible  # type: ignore


@router.post(
    "/report-version/{version_id}/report-contact",
    response={201: ReportPersonResponsibleOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description=(
        """Creates or updates a contact associated with a report version.
                Includes fields like legal name, trade name, operation details, and contact information."""
    ),
)
@handle_http_errors()
def save_report_contact(
    request: HttpRequest, version_id: int, payload: ReportPersonResponsibleIn
) -> Tuple[Literal[201], Optional[ReportPersonResponsibleOut]]:
    print(f"Incoming payload: {payload.dict()}")
    report_contact = ReportService.save_report_contact(version_id, payload)
    return 201, report_contact
