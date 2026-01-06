from typing import Literal, Tuple
from uuid import UUID
from django.forms import model_to_dict
from django.http import HttpRequest

from reporting.api_v2._reports._report_version._facility_report.applicable_activities_schema import (
    FacilityReportResponseSchema,
)
from reporting.api_v2.response_builder import ResponseBuilder
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service import custom_codes_4xx
from service.facility_report_service import FacilityReportService
from reporting.api_v2.router import router
from reporting.schema.facility_report import (
    FacilityReportOut,
)
from reporting.api.permissions import (
    approved_authorized_roles_report_version_composite_auth,
)
from reporting.api_v2._reports._report_version._facility_report.applicable_activities_mixin import (
    ApplicableActivitiesMixin,
)


class FacilityReportResponseBuilder(ResponseBuilder, ApplicableActivitiesMixin):

    pass


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={200: FacilityReportResponseSchema[FacilityReportOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a single matching `facility_report` object.
    Includes the associated activity IDs in the payload if found; otherwise, returns an error message if not found or in case of other issues.
    Also includes the list of applicable activities for that report version. This is used to populate the activities on the review facility info page.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_facility_review_report_data(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[Literal[200], dict]:
    facility_report = FacilityReportService.get_facility_report_by_version_and_id(version_id, facility_id)
    data = model_to_dict(facility_report)
    data['facility_id'] = facility_report.facility.id
    builder = FacilityReportResponseBuilder()
    response = builder.applicable_activities(version_id).payload(data).build()
    return 200, response
