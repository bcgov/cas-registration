from collections.abc import Callable, Iterable
from typing import Any, List, Optional, Tuple


def _field_filter(
    obj: list[tuple[str, Any]],
    include: set | None = None,
    exclude_none: bool = False,
) -> Iterable[tuple[str, Any]]:
    """
    Helper function to include only specified fields from a dataclass in the output dict.
    The field information passed to the factory by dataclasses.asdict is a list of tuples in the form (field_name, field_value).
    """
    if include is not None and not isinstance(include, set):
        raise ValueError("The 'include' parameter must be a set of field names.")

    for field in obj:
        if include is not None and field[0] not in include:
            continue
        if exclude_none and field[1] is None:
            continue
        yield field


def dict_factory(
    include: set | None = None, exclude_none: bool = False
) -> Callable[[list[tuple[str, Any]]], dict]:
    """
    Factory function that returns a function to include only specified fields in the output dict.
    """

    def factory_func(obj: Any) -> dict:
        return dict(_field_filter(obj, include=include, exclude_none=exclude_none))

    return factory_func
