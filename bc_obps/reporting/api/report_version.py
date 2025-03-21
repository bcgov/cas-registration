from typing import Literal, Tuple, List

from django.db.models import QuerySet

from common.permissions import authorize
from django.http import HttpRequest
from registration.models import RegulatedProduct
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.report_service import ReportService
from reporting.service.report_version_service import ReportVersionService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.report_operation import ReportOperationIn, ReportOperationSchemaOut, ReportOperationOut
from .router import router
from ..schema.report_regulated_products import RegulatedProductOut
from ..models import  ReportVersion
from ..schema.report_version import ReportVersionTypeIn, ReportingVersionOut

@router.get(
    "/report-version/{version_id}/report-operation/regulated-products",
    response={200: List[RegulatedProductOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves all regulated products associated with a report operation identified by its version ID.""",
    auth=authorize("approved_industry_user"),
)
def get_regulated_products_by_version_id(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], QuerySet[RegulatedProduct]]:
    regulated_products = ReportVersionService.get_regulated_products_by_version_id(version_id)
    return 200, regulated_products


@router.get(
    "/report-version/{version_id}/report-type",
    response={200: ReportingVersionOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Retrieve the report type for a specific reporting version, including the reporting year and due date.",
    auth=authorize("approved_industry_user"),
)
def get_report_type_by_version(request: HttpRequest, version_id: int) -> tuple[Literal[200], ReportVersion]:
    report_type = ReportVersionService.get_report_type_by_version_id(version_id)
    return 200, report_type


@router.get(
    "/report-version/{version_id}/registration-purpose",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the registration purpose for the operation associated with the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
def get_registration_purpose_by_version_id(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    response_data = ReportVersionService.get_registration_purpose_by_version_id(version_id)
    return 200, response_data


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationSchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_authorized_roles"),
)
def get_report_operation_by_version_id(request: HttpRequest, version_id: int) -> dict:
    report_service = ReportVersionService.get_report_operation_by_version_id(version_id)
    return report_service


@router.post(
    "/report-version/{version_id}/report-operation",
    response={201: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=authorize("approved_industry_user"),
)
def save_report(
    request: HttpRequest, version_id: int, payload: ReportOperationIn
) -> Tuple[Literal[201], ReportOperationOut]:
    report_operation = ReportService.save_report_operation(version_id, payload)
    return 201, report_operation  # type: ignore


@router.post(
    "/report-version/{version_id}/change-report-type",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Changes the report type of a report version. This operation deletes the report version, including all existing data associated with that report version,
    and returns the id of a newly initialized report version.""",
    auth=authorize("approved_industry_user"),
)
def change_report_version_type(
    request: HttpRequest, version_id: int, payload: ReportVersionTypeIn
) -> Tuple[Literal[201], int]:
    report_version = ReportVersionService.change_report_version_type(version_id, payload.report_type)
    return 201, report_version.id

