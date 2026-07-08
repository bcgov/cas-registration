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

        timeline = OperationDesignatedOperatorTimeline.objects.filter(
            Q(end_date__year__gt=reporting_year) | Q(end_date__isnull=True),
            start_date__year__lte=reporting_year,
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

    @classmethod
    def get_operation_designated_operators_for_reporting_years(
        cls,
        operation_ids: set[UUID],
        min_year: int,
        max_year: int,
    ) -> dict[tuple[UUID, int], OperationDesignatedOperatorTimelinePlus]:
        """
        Bulk version of get_operation_designated_operator_for_reporting_year.

        Returns designated operator timelines for every operation/year combination
        between min_year and max_year, inclusive.

        Returns a lookup keyed by (operation_id, reporting_year).
        """
        if not operation_ids:
            return {}

        reporting_years = range(min_year, max_year + 1)

        timelines = (
            OperationDesignatedOperatorTimeline.objects.select_related(
                "operation",
                "operator",
            )
            .filter(
                operation_id__in=operation_ids,
                start_date__year__lte=max_year,
            )
            .filter(Q(end_date__year__gt=min_year) | Q(end_date__isnull=True))
            .order_by("operation__name", "start_date")
        )

        lookup: dict[tuple[UUID, int], OperationDesignatedOperatorTimelinePlus] = {}

        for timeline in timelines:
            if timeline.start_date is None:
                continue

            start_year = timeline.start_date.year
            end_year = timeline.end_date.year if timeline.end_date else None

            for reporting_year in reporting_years:
                if start_year > reporting_year:
                    continue

                if end_year is not None and end_year <= reporting_year:
                    continue

                lookup[(timeline.operation_id, reporting_year)] = OperationDesignatedOperatorTimelinePlus(
                    operation=timeline.operation,
                    operator=timeline.operator,
                    start_date=timeline.start_date,
                    end_date=timeline.end_date,
                )

        return lookup
