from typing import Any, Dict, List, Optional

from django.core.paginator import Paginator
from django.db.models import Case, Count, IntegerField, QuerySet, Sum, When
from django.http import HttpRequest
from ninja import Query, Schema
from ninja.pagination import PaginationBase
from registration.models import Operation


def is_operation_opted_out(
    reporting_year: int,
    registration_purpose: str | None,
    operation_opted_out_final_reporting_year: int | None,
) -> bool:
    """
    Returns True if an operation is considered opted out.

    An operation is opted out only when:
    - its registration purpose is OPTED_IN_OPERATION
    - a final reporting year is set
    - the final reporting year is less than or equal to the current reporting year
    """
    if registration_purpose != Operation.Purposes.OPTED_IN_OPERATION:
        return False

    if operation_opted_out_final_reporting_year is None:
        return False

    return operation_opted_out_final_reporting_year <= reporting_year


def should_include_jan_mar_production(
    reporting_year: int,
    registration_purpose: str | None,
    operation_opted_out_final_reporting_year: int | None,
) -> bool:
    """
    Returns True if Jan–Mar production data should be included in schema

    Jan–Mar production data is only applicable when:
    - the reporting year is 2025, and
    - the operation is considered opted out (see `is_operation_opted_out`)

    This reflects the temporary rule for 2025 where opted-in operations
    that opt out are assessed only on production from Jan 1 to Mar 31.
    """
    return reporting_year == 2025 and is_operation_opted_out(
        reporting_year=reporting_year,
        registration_purpose=registration_purpose,
        operation_opted_out_final_reporting_year=operation_opted_out_final_reporting_year,
    )


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
