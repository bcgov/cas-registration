from datetime import datetime
from typing import Optional
from uuid import UUID
from django.db.models import Q
from dataclasses import dataclass
from registration.models import OperationDesignatedOperatorTimeline
from registration.models.operation import Operation
from registration.models.operator import Operator
from django.utils import timezone


@dataclass
class OperationDesignatedOperatorTimelinePlus:
    operation: Operation
    operator: Operator
    start_date: datetime | None
    end_date: datetime | None

    @property
    def has_been_transferred(self) -> bool:
        return self.end_date is not None and self.end_date.date() <= timezone.now().date()


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
    ) -> Optional[OperationDesignatedOperatorTimelinePlus]:
        """
        Retrieves the OperationDesignatedOperatorTimeline record for a specific operation and reporting year,
        with an annotated boolean field 'has_been_transferred'.
        """

        end_of_reporting_year = datetime(reporting_year, 12, 31).date()
        timeline = OperationDesignatedOperatorTimeline.objects.filter(
            Q(end_date__gte=end_of_reporting_year) | Q(end_date__isnull=True),
            start_date__lte=end_of_reporting_year,
            operation_id=operation_id,
        ).first()
        if not timeline:
            return None
        return OperationDesignatedOperatorTimelinePlus(
            operation=timeline.operation,
            operator=timeline.operator,
            start_date=timeline.start_date,
            end_date=timeline.end_date,
        )
