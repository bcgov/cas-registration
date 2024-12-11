from datetime import datetime
from typing import Optional
from uuid import UUID
from django.db.models import QuerySet
from registration.models import OperationDesignatedOperatorTimeline


class OperationDesignatedOperatorTimelineService:
    @classmethod
    def list_timeline_by_operator_id(
        cls,
        operator_id: UUID,
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        """
        List active timelines belonging to a specific operator.
        """
        return OperationDesignatedOperatorTimeline.objects.filter(
            operator_id=operator_id, end_date__isnull=True
        ).distinct()

    @classmethod
    def get_current_timeline(
        cls, operator_id: UUID, operation_id: UUID
    ) -> Optional[OperationDesignatedOperatorTimeline]:
        return OperationDesignatedOperatorTimeline.objects.filter(
            operator_id=operator_id, operation_id=operation_id, end_date__isnull=True
        ).first()

    @classmethod
    def set_timeline_status_and_end_date(
        cls,
        user_guid: UUID,
        timeline: OperationDesignatedOperatorTimeline,
        status: OperationDesignatedOperatorTimeline.Statuses,
        end_date: datetime,
    ) -> OperationDesignatedOperatorTimeline:
        timeline.status = status
        timeline.end_date = end_date
        timeline.save(update_fields=["status", "end_date"])
        timeline.set_create_or_update(user_guid)
        return timeline
