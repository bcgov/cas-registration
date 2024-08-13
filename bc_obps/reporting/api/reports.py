from typing import Literal, Tuple, Dict, Union
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
from ..models import FacilityReport
from ..schema.facility_report import FacilityReportOut, FacilityReportIn


@router.post(
    "/reports",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Starts a report for a given operation and reporting year, by creating the underlying data structures and
    pre-populating them with facility, operation and operator information. Returns the id of the report that was created.
    This endpoint only allows the creation of a report for an operation / operator to which the current user has access.""",
)
@handle_http_errors()
def start_report(request: HttpRequest, payload: StartReportIn) -> Tuple[Literal[201], int]:
    report = ReportService.create_report(payload.operation_id, payload.reporting_year)
    return 201, report.id


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
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
)
@handle_http_errors()
def get_reporting_year(request: HttpRequest) -> Tuple[Literal[200], int]:
    return 200, ReportingYearService.get_current_reporting_year().reporting_year


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={200: FacilityReportOut, 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a single matching `facility_report` object.
    Includes the associated activity IDs if found; otherwise, returns an error message if not found or in case of other issues.""",
)
@handle_http_errors()
def get_facility_report_by_version_and_id(
    request: HttpRequest, version_id: int, facility_id: int
) -> Union[
    Tuple[Literal[200], FacilityReportOut],
    Tuple[Literal[404], Dict[str, str]],
    Tuple[Literal[400], Dict[str, str]],
    Tuple[Literal[500], Dict[str, str]],
]:
    try:
        facility_report = ReportService.get_facility_report_by_version_and_id(version_id, facility_id)

        if facility_report:
            activity_ids = ReportService.get_activity_ids_for_facility(facility_report) or []
            response_data = FacilityReportOut(
                id=facility_report.id,
                report_version_id=facility_report.report_version.id,
                facility_name=facility_report.facility_name,
                facility_type=facility_report.facility_type,
                facility_bcghgid=facility_report.facility_bcghgid,
                activities=activity_ids,
                products=[],
            )
            return 200, response_data

        else:
            return 404, {"message": "Facility not found"}

    except ValueError as ve:
        return 400, {"message": f"Invalid input: {str(ve)}"}

    except Exception as e:
        return 500, {"message": "An unexpected error occurred", "details": str(e)}


@router.post(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={201: FacilityReportOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates the report facility details by version_id and facility_id. The request body should include
    fields to be updated, such as facility name, type, BC GHG ID, activities, and products. Returns the updated report
    facility object or an error message if the update fails.""",
)
@handle_http_errors()
def save_facility_report(
    request: HttpRequest, version_id: int, payload: FacilityReportIn
) -> Union[
    Tuple[Literal[201], FacilityReportOut],
    Tuple[Literal[400], Dict[str, str]],
    Tuple[Literal[404], Dict[str, str]],
    Tuple[Literal[500], Dict[str, str]],
]:
    """
    Save or update a report facility and its related activities.

    Args:
        request (HttpRequest): The HTTP request object.
        version_id (int): The ID of the report version.
        payload (FacilityReportIn): The input data for the report facility.

    Returns:
        Tuple: HTTP status code and the response data or an error message.
    """
    try:
        # Save or update the report facility using the service layer
        facility_report = ReportService.save_facility_report(version_id, payload)

        # Prepare the response data
        response_data = FacilityReportOut(
            id=facility_report.id,
            report_version_id=facility_report.report_version.id,
            facility_name=facility_report.facility_name,
            facility_type=facility_report.facility_type,
            facility_bcghgid=facility_report.facility_bcghgid,
            activities=list(facility_report.activities.values_list('id', flat=True)),
            products=list(facility_report.products.values_list('id', flat=True)) or [],
        )
        return 201, response_data

    except ValueError as ve:
        return 400, {"message": f"Invalid input: {str(ve)}"}

    except FacilityReport.DoesNotExist:
        return 404, {"message": "Report facility not found"}

    except Exception as e:
        return 500, {"message": "An unexpected error occurred", "details": str(e)}
