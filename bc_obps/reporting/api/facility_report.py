from typing import Literal, Tuple, List, Optional
from uuid import UUID
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.facility_report_service import FacilityReportService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.schema.facility_report import (
    FacilityReportIn,
    FacilityReportOut,
    FacilityReportListSchema,
    FacilityReportListInSchema,
    FacilityReportFilterSchema,
)
from reporting.schema.activity import FacilityReportActivityDataOut
from registration.models import Activity, Operation
from reporting.models import FacilityReport, ReportVersion, Report
from ninja.pagination import paginate
from ninja import Query
from django.db.models import QuerySet
from common.permissions import authorize

from ..utils import ReportingCustomPagination
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
    approved_authorized_roles_report_version_composite_auth,
)


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={200: FacilityReportOut, 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a single matching `facility_report` object.
    Includes the associated activity IDs if found; otherwise, returns an error message if not found or in case of other issues.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_facility_report_form_data(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[Literal[200], FacilityReport]:
    facility_report = FacilityReportService.get_facility_report_by_version_and_id(version_id, facility_id)
    return 200, facility_report


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}/activity-list",
    response={200: List[FacilityReportActivityDataOut], 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a list of activities that apply to that facility, ordered by weight""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_ordered_facility_report_activities(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[Literal[200], QuerySet[Activity]]:
    facility_report_activities = FacilityReportService.get_activity_ids_for_facility(version_id, facility_id)
    response = Activity.objects.filter(pk__in=facility_report_activities).order_by("weight", "name")

    return 200, response


@router.post(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={201: FacilityReportOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates the report facility details by version_id and facility_id. The request body should include
    fields to be updated, such as facility name, type, BC GHG ID, activities, and products. Returns the updated report
    facility object or an error message if the update fails.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_facility_report(
    request: HttpRequest, version_id: int, facility_id: UUID, payload: FacilityReportIn
) -> Tuple[Literal[201], FacilityReport]:
    """
    Save or update a report facility and its related activities.

    Args:
        request (HttpRequest): The HTTP request object.
        version_id (int): The ID of the report version.
        facility_id (int): The ID of the facility.
        payload (FacilityReportIn): The input data for the report facility.

    Returns:
        Tuple: HTTP status code and the response data or an error message.
    """
    # Fetch the existing facility report or create a new one
    facility_report = FacilityReportService.save_facility_report(version_id, facility_id, payload)

    # Prepare the response data
    return 201, facility_report


@router.get(
    "/report-version/{version_id}/facility-report",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_facility_report_by_version_id(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    facility_report = FacilityReportService.get_facility_report_by_version_id(version_id)
    facility_id = facility_report[0] if isinstance(facility_report, tuple) else facility_report

    operation_type = Operation.objects.get(
        id=Report.objects.get(id=ReportVersion.objects.get(id=version_id).report_id).operation_id
    ).type

    response_data = {
        "facility_id": facility_id,
        "operation_type": operation_type,
    }

    return 200, response_data


@router.put(
    "/report-version/{version_id}/facility-report/{facility_id}/update",
    response={200: FacilityReportOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Updates the facility report details by version_id and facility_id.",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def update_facility_report(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> tuple[Literal[200], FacilityReport]:
    facility_report = FacilityReportService.update_facility_report(version_id, facility_id)
    return 200, facility_report


@router.get(
    "/report-version/{version_id}/facility-report-list",
    response={200: list[FacilityReportListSchema], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns a list of facilities with their
    details.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(ReportingCustomPagination, page_size=10)
def get_facility_report_list(
    request: HttpRequest,
    version_id: int,
    filters: FacilityReportFilterSchema = Query(...),
    sort_field: Optional[str] = "facility_name",
    sort_order: Optional[Literal["desc", "asc"]] = "asc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[FacilityReport]:
    return FacilityReportService.get_facility_report_list(version_id, sort_field, sort_order, filters)


@router.patch(
    "/report-version/{version_id}/facility-report-list",
    response={200: int, custom_codes_4xx: Message},
    tags=["Emissions Report"],
    description="""Updates facility report details by version_id. The request body should include fields
    to be updated for the respective facility reports.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_facility_report_list(
    request: HttpRequest, version_id: int, payload: List[FacilityReportListInSchema]
) -> Literal[200]:
    FacilityReportService.save_facility_report_list(version_id, payload)
    return 200
