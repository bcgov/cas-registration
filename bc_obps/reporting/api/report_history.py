from typing import Literal, Tuple, List

from django.db.models import QuerySet, Subquery
from ninja.pagination import PageNumberPagination, paginate

from common.permissions import authorize
from django.http import HttpRequest
from registration.models import RegulatedProduct, Operation
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn
from service.report_service import ReportService
from service.report_version_service import ReportVersionService
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.report_operation import ReportOperationIn, ReportOperationSchemaOut, ReportOperationOut
from reporting.schema.reporting_year import ReportingYearOut
from .router import router
from ..schema.report_history import ReportHistoryResponse, ReportOperation
from ..schema.report_regulated_products import RegulatedProductOut
from ..models import ReportingYear, ReportVersion, Report
from ..schema.report_version import ReportVersionTypeIn, ReportingVersionOut
from typing import List
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from django.db.models import QuerySet
from ninja.pagination import paginate, PageNumberPagination
from common.api.utils import get_current_user_guid
from registration.constants import PAGE_SIZE
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ..service.report_history_dashboard_service import ReportingHistoryDashboardService


@router.get(
    "/report-history/{report_id}",
    response={200: List[ReportHistoryResponse], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
)
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_report_history(request: HttpRequest, report_id: int) -> List[ReportHistoryResponse]:
    print('in api')
    # user_guid: UUID = get_current_user_guid(request)
    report_versions = ReportingHistoryDashboardService.get_report_versions_for_report_history_dashboard(report_id)
    print('data', report_versions.values())

    # Convert the QuerySet to a list of Pydantic models (ReportHistoryResponse)
    return [ReportHistoryResponse.from_orm(report) for report in report_versions]


@router.get(
    "/report-operation/{report_id}",
    response={200: str, 400: Message},  # Specify that the 200 response will be a string
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the operation name as a string for the given report.""",
)
@paginate(PageNumberPagination, page_size=PAGE_SIZE)
def get_report_operation(request: HttpRequest, report_id: int) -> str:
    operation_name = Report.objects.select_related('operation').get(id=report_id).operation.name
    return operation_name

