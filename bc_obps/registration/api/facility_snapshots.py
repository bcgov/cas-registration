from typing import List
from uuid import UUID
from django.http import HttpRequest
from django.db.models import QuerySet
from registration.api.router import router
from registration.constants import FACILITY_TAGS
from registration.models import FacilitySnapshot
from registration.schema import FacilitySnapshotOut, Message
from service.facility_snapshot_service import FacilitySnapshotService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from common.permissions import authorize


@router.get(
    "/facilities/snapshots",
    response={200: List[FacilitySnapshotOut], custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Retrieves facility snapshots for a given operation and facility.""",
    auth=authorize("approved_industry_user"),
)
def get_facility_snapshots(
    request: HttpRequest,
    operation_id: UUID,
    facility_id: UUID,
) -> tuple[int, QuerySet[FacilitySnapshot]]:
    """
    Get facility snapshots based on operation_id and facility_id.

     Args:
        request: The HTTP request
        operation_id: The operation ID to filter snapshots
        facility_id: The facility ID to filter snapshots

    Returns:
        Tuple of (status_code, QuerySet of FacilitySnapshot instances)
    """
    return 200, FacilitySnapshotService.get_facility_snapshots_by_operation_and_facility(
        operation_id=operation_id,
        facility_id=facility_id,
    )
