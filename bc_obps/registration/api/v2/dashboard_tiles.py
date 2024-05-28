from django.http import HttpRequest
from registration.decorators import authorize
from ..router import router
from typing import List, Literal, Tuple
from registration.models import AppRole, UserOperator
from registration.schema.v2 import DashboardTile

##### GET #####


@router.get("/v2/dashboard-tiles", response=List[DashboardTile], url_name="get_dashboard_tiles", tags=["V2"])
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles(), False)
# def get_dashboard_tiles(request: HttpRequest) -> Tuple[Literal[200], List[DashboardTile]]:
def get_dashboard_tiles(request: HttpRequest) -> Tuple[Literal[200], List[dict[str, str]]]:
    return 200, [
        {
            "href": "/dashboard",
            "content": "View or update information of your operator here.",
            "title": "My Operator",
        },
        {
            "href": "/dashboard",
            "content": "View the operations owned by your operator, or to add new operation to your operator here.",
            "title": "Operations",
        },
        {
            "href": "/dashboard",
            "content": "View the contacts of your operator, or to add new contact for your operator here.",
            "title": "Contacts",
        },
        {
            "href": "/dashboard",
            "content": "View, approve or decline Business BCeID user access requests to your operator, or to assign access type to users here.",
            "title": "Users",
        },
        {
            "href": "/dashboard",
            "content": "Track the registration of operations, or to start new registration here.",
            "title": "Register an Operation",
        },
        {
            "href": "/dashboard",
            "content": "Report sales, transfer, closure, acquisition, divestment, change in operator or director control, temporary shut down, etc. here.",
            "title": "Report an Event",
        },
    ]
