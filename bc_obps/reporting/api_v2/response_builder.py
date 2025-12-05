from django.db.models import QuerySet
from typing import Self

from django.http import HttpRequest
from ninja.pagination import PageNumberPagination
from reporting.constants import PAGE_SIZE


class ResponseBuilder:

    def __init__(
        self,
    ) -> None:
        self.response: dict = {}

    def payload(self, payload: dict) -> Self:
        self.response["payload"] = payload
        return self

    def build(self) -> dict:
        return self.response


class PaginatedResponseBuilder:

    def __init__(self, request: HttpRequest, page_size: int = PAGE_SIZE, page: int = 1) -> None:
        self.response: dict = {}
        self.pagination = PageNumberPagination.Input(page=page, page_size=page_size, **request.GET.dict())

    def payload(self, payload: QuerySet) -> Self:
        self.response['payload'] = PageNumberPagination().paginate_queryset(payload, self.pagination)
        return self

    def build(self) -> dict:
        # Evaluate the queryset on build
        self.response['payload']['items'] = list(self.response['payload']['items'])
        return self.response
