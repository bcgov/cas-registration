from collections.abc import Iterable
from typing import Any, Self
from common.exceptions import SerializableError


class UserErrorResponseBuilder:
    def __init__(self) -> None:
        self.response: dict[str, Any] = {"errors": []}

    def errors(self, errors: Iterable[SerializableError]) -> Self:
        self.response["errors"] = [
            {
                "key": error.key.value,
                "error": error.serialize(),
            }
            for error in errors
        ]
        return self

    def build(self) -> dict[str, Any]:
        return self.response
