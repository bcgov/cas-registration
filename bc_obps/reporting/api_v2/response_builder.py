from typing import Self


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
