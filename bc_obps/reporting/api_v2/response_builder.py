from django.db.models import QuerySet
from typing import Self

from ninja.pagination import PageNumberPagination

class ResponseBuilder:

    def __init__(
        self,
    ):
        self.response = {}

    def payload(self, payload: dict) -> Self:
        self.response["payload"] = payload
        return self

    def build(self) -> dict:
        return self.response


class PaginatedResponseBuilder:
    def __init__(self, page_size:int, **kwargs,):
        self.response = {}
        self.input = PageNumberPagination.Input(page_size=page_size, **kwargs)

    def payload(self, payload: QuerySet) -> Self:
        self.response["payload"] = payload
        paginator = PageNumberPagination(page_size=self.page_size)
        self.response['payload'] = paginator.paginate_queryset(
            payload, self.input
        )
        self.response['payload']['items'] = list(self.response['payload']['items'])
        print('*********** payload:', self.response['payload'])
        return self

    def build(self) -> dict:
        return self.response
