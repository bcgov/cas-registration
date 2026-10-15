from typing import Literal, Tuple

from django.http import HttpRequest

from audit_log.constants import AUDIT_LOG
from audit_log.schema.audit_log import AuditLogListOut
from audit_log.service.audit_log_service import AuditLogService
from common.permissions import authorize
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx

from .router import router


# TODO: This endpoint has no row-level security applied yet -- any authorized user (including any
# approved industry user) can currently query the audit log for any entity by guessing its
# entity_id. RLS must be added here before this is production-ready.
@router.get(
    "/{entity_type}/{entity_id}",
    response={200: AuditLogListOut, custom_codes_4xx: Message},
    tags=AUDIT_LOG,
    description="Retrieves the entity's display name and its audit log entries, most recent first.",
    auth=authorize("approved_authorized_roles"),
)
def get_audit_log(request: HttpRequest, entity_type: str, entity_id: str) -> Tuple[Literal[200], dict]:
    return 200, {
        "entity_display_name": AuditLogService.get_entity_display_name(entity_type, entity_id),
        "entries": AuditLogService.get_audit_log(entity_type, entity_id),
    }
