from typing import Any, Dict, List, Optional

from django.core.paginator import Paginator
from django.db.models import Case, Count, IntegerField, QuerySet, Sum, When
from django.http import HttpRequest
from ninja import Query, Schema
from ninja.pagination import PaginationBase


class ReportingCustomPagination(PaginationBase):
    """Custom pagination with complete_count."""

    class Input(Schema):
        page: int = Query(1, ge=1)  # Input schema for page number

    class Output(Schema):
        items: List[Any]  # `items` is a default attribute
        count: int  # Total count of all items
        is_completed_count: Optional[int]  # Count of completed items

    def paginate_queryset(
        self, queryset: QuerySet[Any], pagination: Input, request: HttpRequest, **params: Any
    ) -> Dict[str, Any]:
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
