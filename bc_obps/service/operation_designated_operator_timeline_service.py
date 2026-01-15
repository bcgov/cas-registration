from datetime import datetime
from typing import Optional
from uuid import UUID
from django.db.models import Q
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
    def set_timeline_end_date(
        cls,
        timeline: OperationDesignatedOperatorTimeline,
        end_date: datetime,
    ) -> OperationDesignatedOperatorTimeline:
        timeline.end_date = end_date
        timeline.save(update_fields=["end_date"])
        return timeline

    @classmethod
    def get_operation_designated_operator_for_reporting_year(
        cls, operation_id: UUID, reporting_year: int
    ) -> OperationDesignatedOperatorTimeline | None:
        """
        Retrieves the OperationDesignatedOperatorTimeline record for a specific operation and reporting year.
        """

        end_of_reporting_year = datetime(reporting_year, 12, 31).date()

        return OperationDesignatedOperatorTimeline.objects.filter(
            Q(end_date__gte=end_of_reporting_year) | Q(end_date__isnull=True),
            start_date__lte=end_of_reporting_year,
            operation_id=operation_id,
        ).first()
