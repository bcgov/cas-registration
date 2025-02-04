from typing import Any

from django.core.paginator import Paginator
from ninja import Schema, Query
from ninja.pagination import PageNumberPagination, PaginationBase
from django.db.models import QuerySet, Sum
from typing import List, Optional, Literal, Any

from django.db.models import QuerySet, Count, Case, When, IntegerField
from ninja.types import DictStrAny


def validate_overlapping_records(
        object_class: Any,
        save_self: Any,
        exception_message: str,
) -> None:
    if hasattr(object_class, "source_type"):
        all_ranges = object_class.objects.select_related('valid_from', 'valid_to').filter(
            activity=save_self.activity, source_type=save_self.source_type
        )
    else:
        all_ranges = object_class.objects.select_related('valid_from', 'valid_to').filter(activity=save_self.activity)
    for y in all_ranges:
        if (
                (save_self.valid_from.valid_from >= y.valid_from.valid_from)
                and (save_self.valid_from.valid_from <= y.valid_to.valid_to)
        ) or (
                (save_self.valid_to.valid_to <= y.valid_to.valid_to)
                and (save_self.valid_to.valid_to >= y.valid_from.valid_from)
        ):
            raise Exception(exception_message)


class ReportingCustomPagination(PaginationBase):
    """Custom pagination with complete_count."""

    class Input(Schema):
        page: int = Query(1, ge=1)  # Input schema for page number

    class Output(Schema):
        items: List[Any]  # `items` is a default attribute
        count: int  # Total count of all items
        is_completed_count: int  # Count of completed items

    def paginate_queryset(self, queryset, pagination: Input, **params):
        page = pagination.page
        page_size = 10  # Or use settings.PAGINATION_PER_PAGE

        # Calculate total count and complete_count
        results = queryset.aggregate(
            total_count=Count('*'),  # Total count of all items
            completed_count=Sum(Case(When(is_completed=True, then=1), default=0, output_field=IntegerField())),
            # Count of completed items
            not_completed_count=Sum(Case(When(is_completed=False, then=1), default=0, output_field=IntegerField()))
            # Count of items not completed
        )

        # Paginate the queryset using Django's Paginator
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        return {
            "items": list(page_obj.object_list),  # Items for the current page
            "count": results['total_count'],  # Total count of items
            "is_completed_count":  queryset.filter(is_completed=True).count(),  # Number of completed items
        }
