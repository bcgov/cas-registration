from typing import Any, Dict, List, Optional
from uuid import UUID

from ninja import Schema

from audit_log.models import AuditLog


class AuditLogOut(Schema):
    """
    Schema for a single audit log entry returned from the get audit log endpoint.
    """

    action: str
    timestamp: str
    snapshot: Dict[str, Any]
    changed_fields: List[str]
    reason: Optional[str] = None
    actor_guid: Optional[UUID] = None
    actor_display_name: Optional[str] = None

    @staticmethod
    def resolve_timestamp(obj: AuditLog) -> str:
        return obj.timestamp.isoformat()

    @staticmethod
    def resolve_actor_display_name(obj: AuditLog) -> Optional[str]:
        if obj.actor:
            return obj.actor.get_full_name()
        return None


class AuditLogListOut(Schema):
    """
    Schema for the full get audit log response: the entity's human-readable display name,
    plus its list of audit log entries.
    """

    entity_display_name: str
    entries: List[AuditLogOut]
