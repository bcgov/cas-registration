from typing import Literal, Tuple
from django.http import HttpRequest
from common.permissions import authorize
from common.api.utils import get_current_user
from compliance.constants import COMPLIANCE
from compliance.schema.payments import DashboardPaymentList
from service.error_service.custom_codes_4xx import custom_codes_4xx
from compliance.service.compliance_dashboard_service import (
    PaymentsDashboardList,
    PaymentDashboardRow,
)
from registration.schema.generic import Message
from compliance.api.router import router


@router.get(
    "/dashboard-payments",
    response={200: DashboardPaymentList, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Get all payments an operator has made",
    auth=authorize("approved_industry_user"),
)
def get_payments_for_dashboard(request: HttpRequest) -> Tuple[Literal[200], PaymentsDashboardList]:
    user = get_current_user(request)
    return 200, PaymentsDashboardList(
        rows=[
            PaymentDashboardRow(
                id=1,
                compliance_period=2024,
                operation_name='OP 1',
                payment_towards='Beer',
                invoice_number='INV-01',
                payment_amount=100.01,
                outstanding_balance=500.05,
            )
        ],
        row_count=1,
    )
    # return 200, ComplianceDashboardService.get_payments_for_dashboard(user)
