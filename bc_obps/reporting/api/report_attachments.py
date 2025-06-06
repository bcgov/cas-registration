from typing import List, Literal, Optional, Tuple
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import File, Form, Query, UploadedFile
from ninja.pagination import paginate
from registration.utils import CustomPagination
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion
from reporting.schema.generic import Message
from reporting.schema.report_attachment import (
    AttachmentsWithConfirmationOut,
    InternalReportAttachmentFilterSchema,
    InternalReportAttachmentOut,
)
from reporting.service.report_attachment_service import ReportAttachmentService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
    approved_authorized_roles_report_version_composite_auth,
)


@router.post(
    "report-version/{version_id}/attachments",
    response={200: AttachmentsWithConfirmationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Saves both attachments and supplementary report confirmation flags",
    auth=approved_industry_user_report_version_composite_auth,
)
@transaction.atomic()
def save_report_attachments(
    request: HttpRequest,
    version_id: int,
    file_types: Optional[List[str]] = Form(None),
    files: Optional[List[UploadedFile]] = File(None),
    confirm_supplementary_existing_attachments_relevant: Optional[bool] = Form(None),
    confirm_supplementary_required_attachments_uploaded: Optional[bool] = Form(None),
) -> Tuple[int, dict]:
    # Handle files if they were supplied
    if files is not None:
        if file_types is None or len(file_types) != len(files):
            raise IndexError("file_types and files parameters must be of the same length")
        user_guid = get_current_user_guid(request)
        for ftype, file in zip(file_types, files):
            ReportAttachmentService.set_attachment(version_id, user_guid, ftype, file)

    # Handle supplementary report confirmation flags if supplied
    if (
        confirm_supplementary_existing_attachments_relevant is not None
        or confirm_supplementary_required_attachments_uploaded is not None
    ):
        ReportAttachmentService.save_attachment_confirmation(
            report_version_id=version_id,
            confirm_existing_relevant=bool(confirm_supplementary_existing_attachments_relevant),
            confirm_required_uploaded=bool(confirm_supplementary_required_attachments_uploaded),
        )

    return get_report_attachments(request, version_id)


@router.get(
    "report-version/{version_id}/attachments",
    response={200: AttachmentsWithConfirmationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Returns both the attachments and (if any) the supplementary report confirmation.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_attachments(
    request: HttpRequest,
    version_id: int,
) -> Tuple[int, dict]:
    attachments = ReportAttachmentService.get_attachments(version_id)
    confirmation = ReportAttachmentService.get_attachment_confirmation(version_id)

    response_data = {
        "attachments": attachments,
        "confirmation": confirmation,
    }
    return 200, response_data


@router.get(
    "report-version/{version_id}/attachments/{file_id}",
    response={200: str, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the cloud download URL for a file attachment.""",
    auth=approved_authorized_roles_report_version_composite_auth,
)
def get_report_attachment_url(request: HttpRequest, version_id: int, file_id: int) -> Tuple[Literal[200], str]:
    return 200, ReportAttachmentService.get_attachment(version_id, file_id).get_file_url()


@router.get(
    "attachments",
    response={200: list[InternalReportAttachmentOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the list of all attachments for all reports.""",
    auth=authorize("authorized_irc_user"),
)
@paginate(CustomPagination)
def get_all_attachments(
    request: HttpRequest,
    filters: InternalReportAttachmentFilterSchema = Query(...),
    sort_field: Optional[str] = "id",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[ReportAttachment]:

    mapped_sort_field = (
        "report_version__report__operator__legal_name"
        if sort_field == "operator"
        else "report_version__report__operation__name"
        if sort_field == "operation"
        else sort_field
    )

    sort_direction = "-" if sort_order == "desc" else ""
    sort_by = f"{sort_direction}{mapped_sort_field}"

    attachments_query = ReportAttachment.objects.select_related(
        "report_version",
        "report_version__report__operation",
        "report_version__report__operator",
    ).filter(report_version__status=ReportVersion.ReportVersionStatus.Submitted)

    return filters.filter(attachments_query).order_by(sort_by)
