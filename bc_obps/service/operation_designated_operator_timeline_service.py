from datetime import datetime
from typing import Optional
from uuid import UUID
from registration.models import OperationDesignatedOperatorTimeline


class OperationDesignatedOperatorTimelineService:
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
        return timeline
