from typing import List, Literal, Optional
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.schema.elicensing_invoice import ElicensingInvoiceListOut, ElicensingInvoiceFilterSchema
from compliance.service.elicensing_invoice_service import ElicensingInvoiceService
from django.http import HttpRequest
from django.db.models import QuerySet
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from ninja import Query
from registration.utils import CustomPagination
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja.pagination import paginate
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/elicensing-invoices",
    response={200: List[ElicensingInvoiceListOut], custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all compliance report versions for the current user's operations",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def get_elicensing_invoice_list(
    request: HttpRequest,
    filters: ElicensingInvoiceFilterSchema = Query(...),
    sort_field: Optional[str] = "operation_name",
    sort_order: Optional[Literal["desc", "asc"]] = "asc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[ElicensingInvoice]:
    user_guid = get_current_user_guid(request)
    return ElicensingInvoiceService.get_elicensing_invoice_for_dashboard(
        user_guid, sort_field=sort_field, sort_order=sort_order, filters=filters
    )
