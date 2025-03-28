from typing import Literal, Optional, Tuple
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.report_person_responsible import ReportContactService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from ..models import ReportPersonResponsible
from ..schema.report_person_responsible import ReportPersonResponsibleIn, ReportPersonResponsibleOut
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/person-responsible",
    response={200: Optional[ReportPersonResponsibleOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_person_responsible_by_version_id(
    request: HttpRequest, version_id: int
) -> Tuple[Literal[200], Optional[ReportPersonResponsible]]:
    report_person_responsible = ReportContactService.get_report_person_responsible_by_version_id(version_id)
    return 200, report_person_responsible


@router.post(
    "/report-version/{version_id}/report-contact",
    response={201: ReportPersonResponsibleOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description=(
        """Creates or updates a contact associated with a report version.
                    Includes fields like legal name, trade name, operation details, and contact information."""
    ),
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report_contact(
    request: HttpRequest, version_id: int, payload: ReportPersonResponsibleIn
) -> tuple[Literal[201], ReportPersonResponsible]:
    report_contact = ReportContactService.save_report_contact(version_id, payload)
    return 201, report_contact
