from typing import Any, Iterable, Self, override

from django.http import HttpRequest
from ninja.pagination import PageNumberPagination
from reporting.constants import PAGE_SIZE
from common.exceptions import SerializableError


class ResponseBuilder:
    """
    Builder to make API responses for GET requests.

    It's meant to be a configurable
    """

    def __init__(
        self,
    ) -> None:
        self.response: dict = {}

    def payload(self, payload: dict) -> Self:
        self.response["payload"] = payload
        return self

    def errors(
        self,
        errors: Iterable[dict[str, Any] | SerializableError] | None,
    ) -> Self:
        if errors is None:
            self.response["errors"] = None
        else:
            self.response["errors"] = [
                error.serialize() if isinstance(error, SerializableError) else error for error in errors
            ]

        return self

    def build(self) -> dict:
        return self.response


class PaginatedResponseBuilder(ResponseBuilder):
    """
    Response builder for when the payload is paginated
    """

    @override
    def __init__(self, request: HttpRequest | None = None, page_size: int = PAGE_SIZE, page: int = 1) -> None:
        self.response: dict = {'payload': {"items": []}}
        self.request = request
        pagination_page = int(request.GET.get("page", page)) if request else page
        pagination_page_size = int(request.GET.get("page_size", page_size)) if request else page_size
        self.pagination = PageNumberPagination.Input(page=pagination_page, page_size=pagination_page_size)

    @override
    def payload(self, payload: Iterable) -> Self:
        if self.request is None:
            raise ValueError("Request is required for pagination")
        self.response['payload'] = PageNumberPagination().paginate_queryset(
            payload, self.pagination, self.request  # type: ignore
        )
        return self

    @override
    def build(self) -> dict:
        # Evaluate the queryset on build
        self.response['payload']['items'] = list(self.response['payload']['items'])
        return self.response
