from typing import Literal, Optional, Tuple, List

from django.db.models import QuerySet

from common.permissions import authorize, compose_auth
from django.http import HttpRequest

# from registration.models import RegulatedProduct
from reporting.api.permissions import check_operation_ownership
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn, CreateReportVersionIn, CreateReportForReportingYearIn
from service.report_service import CreateReportForReportingYearData, ReportService
from service.report_version_service import ReportVersionService, ReportVersionData
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.reporting_year import ReportingYearOut
from .router import router

# from ..schema.report_regulated_products import RegulatedProductOut
from ..schema.report_version import ReportVersionTypeIn, ReportVersionIn, ReportingVersionOut
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
    approved_authorized_roles_report_version_composite_auth,
    approved_industry_user_report_composite_auth,
)
from reporting.models import ReportingYear, ReportVersion
from common.api.utils.current_user_utils import get_current_user_guid


@router.post(
    "/create-report",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Starts a report for a given operation and reporting year, by creating the underlying data structures and
    This endpoint only allows the creation of a report for an operation / operator to which the current user has access.""",
    auth=compose_auth(authorize("approved_industry_user"), check_operation_ownership()),
)
def start_report(request: HttpRequest, payload: StartReportIn) -> Tuple[Literal[201], int]:
    report_version_id = ReportService.create_report(payload.operation_id, payload.reporting_year)
    return 201, report_version_id


@router.post(
    "/create-report-for-reporting-year",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""
    Creates a report for a given operation and reporting year
    Allows a new report creation for a selected year if the authenticated user's operator owned the operation
    """,
    auth=authorize("approved_industry_user"),
)
def create_report_for_reporting_year(
    request: HttpRequest,
    payload: CreateReportForReportingYearIn,
) -> Tuple[Literal[201], int]:
    data = CreateReportForReportingYearData(
        operation_id=payload.operation_id,
        reporting_year=payload.reporting_year,
        registration_purpose=payload.registration_purpose,
    )
    report_version_id = ReportService.create_report_for_reporting_year(
        user_guid=get_current_user_guid(request),
        data=data,
    )

    return 201, report_version_id


@router.post(
    "/report-version/{version_id}/change-report-type",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Changes the report type of a report version. This operation deletes the report version, including all existing data associated with that report version,
    and returns the id of a newly initialized report version.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def change_report_version_type(
    request: HttpRequest, version_id: int, payload: ReportVersionTypeIn
) -> Tuple[Literal[201], int]:
    report_version = ReportVersionService.change_report_version_type(version_id, payload.report_type)
    return 201, report_version.id


@router.get(
    "/reporting-year",
    response={200: ReportingYearOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
    auth=authorize("all_roles"),
)
def get_reporting_year(request: HttpRequest) -> Tuple[Literal[200], ReportingYear]:
    return 200, ReportingYearService.get_current_reporting_year()


@router.get(
    "/reporting-years",
    response={200: List[ReportingYearOut], custom_codes_4xx: Message},
    tags=None,
    description="""Returns json object with list of all reporting year objects in database.
    Optionally, filter out reporting years that are in the past using ?exclude_past=true.""",
    auth=authorize("all_roles"),
)
def get_all_reporting_years(
    request: HttpRequest, exclude_past: Optional[bool] = None
) -> Tuple[Literal[200], QuerySet[ReportingYear]]:
    return 200, ReportingYearService.get_all_reporting_years(exclude_past or False)


@router.get(
    "/report-version/{version_id}",
    response={200: ReportingVersionOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Retrieve report version details",
    auth=approved_industry_user_report_version_composite_auth,
    exclude_none=True,
)
def get_report_version(request: HttpRequest, version_id: int) -> Tuple[Literal[200], ReportVersion]:
    report_version = ReportVersion.objects.select_related("report_operation", "report__reporting_year").get(
        id=version_id
    )
    return 200, report_version


@router.post(
    "/report-version/{version_id}",
    response={200: ReportingVersionOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Saves report version details: reason_for_change",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report_version(
    request: HttpRequest, version_id: int, payload: ReportVersionIn
) -> Tuple[Literal[200], ReportVersion]:
    data = ReportVersionData(
        reason_for_change=payload.reason_for_change,
    )
    report_version = ReportVersionService.save_report_version(version_id, data)
    return 200, report_version


@router.get(
    "/report-version/{version_id}/registration_purpose",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the registration purpose for the operation associated with the given report version ID.""",
    auth=authorize("approved_authorized_roles"),
)
def get_registration_purpose_by_version_id(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    response_data = ReportService.get_registration_purpose_by_version_id(version_id)
    return 200, response_data


@router.delete(
    "/report-version/{version_id}",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Deletes the given report version ID.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def delete_report_version(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    response_data = ReportVersionService.delete_report_version(version_id)
    return 200, {"success": response_data}


@router.post(
    "/report/{report_id}/create-report-version",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Creates a report version for an existing report.""",
    auth=approved_industry_user_report_composite_auth,
)
def create_report_version(
    request: HttpRequest, report_id: int, payload: CreateReportVersionIn
) -> Tuple[Literal[200], int]:
    report = ReportService.get_report_by_id(report_id)
    report_version = ReportVersionService.create_report_version(report)
    return 200, report_version.id
