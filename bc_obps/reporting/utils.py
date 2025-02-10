from typing import Any, Dict, Optional

from django.core.paginator import Paginator
from ninja import Schema, Query
from ninja.pagination import PaginationBase
from django.db.models import Sum, QuerySet
from typing import List

from django.db.models import Count, Case, When, IntegerField


def validate_overlapping_records(
    object_class: Any,
    save_self: Any,
    exception_message: str,
) -> None:
    if hasattr(object_class, "source_type"):
        all_ranges = object_class.objects.select_related("valid_from", "valid_to").filter(
            activity=save_self.activity, source_type=save_self.source_type
        )
    else:
        all_ranges = object_class.objects.select_related("valid_from", "valid_to").filter(activity=save_self.activity)
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
        is_completed_count: Optional[int]  # Count of completed items

    def paginate_queryset(self, queryset: QuerySet[Any], pagination: Input, **params: Any) -> Dict[str, Any]:
        page = pagination.page
        page_size = 10

        # Calculate total count and complete_count
        results = queryset.aggregate(
            total_count=Count("*"),
            completed_count=Sum(
                Case(
                    When(is_completed=True, then=1),
                    default=0,
                    output_field=IntegerField(),
                )
            ),
        )

        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        return {
            "items": list(page_obj.object_list),  # Items for the current page
            "count": results["total_count"],  # Total count of items
            "is_completed_count": results["completed_count"],
        }
