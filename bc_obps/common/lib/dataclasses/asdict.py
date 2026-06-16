import dataclasses
from typing import Any, Optional
from .dict_factory import dict_factory


def asdict(obj: Any, *, include: Optional[set] = None, exclude_none: bool = False) -> dict:
    """
    Providing an alternative to dataclasses.asdict to give an API similar to pydantic's dict method.
    """

    return dataclasses.asdict(obj, dict_factory=dict_factory(include=include, exclude_none=exclude_none))
