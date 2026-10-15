from django.db.models import QuerySet

from audit_log.config.registry import AUDITED_VIEWS
from audit_log.models import AuditLog


class AuditLogService:
    """
    Service for retrieving audit log entries.
    """

    @classmethod
    def get_audit_log(cls, entity_type: str, entity_id: str) -> QuerySet[AuditLog]:
        """
        Gets all audit log entries for a specific entity, most recent first.

        Args:
            entity_type (str): The type of entity, e.g. 'operation' or 'report'
            entity_id (str): The primary key of the entity, stringified

        Returns:
            QuerySet[AuditLog]: The audit log entries for the specified entity
        """
        return AuditLog.objects.filter(entity_type=entity_type, entity_id=str(entity_id)).order_by("-timestamp")

    @classmethod
    def get_entity_display_name(cls, entity_type: str, entity_id: str) -> str:
        """
        Resolves a human-readable label for the audited entity (e.g. an operation's name),
        via the registered view's `display_name_resolver`. Falls back to the raw entity_id
        if the entity_type isn't registered or the entity can't be found.
        """
        view = AUDITED_VIEWS.get(entity_type)
        if view is None:
            return entity_id
        return view.display_name_resolver(entity_id)
