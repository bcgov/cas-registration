import dataclasses

from common.lib.dataclasses import dict_factory


def asdict(obj, *, include: set = None, exclude_none: bool = False):
    """
    Providing an alternative to dataclasses.asdict to give an API similar to pydantic's dict method.
    """
    return dataclasses.asdict(obj, dict_factory=dict_factory(include=include, exclude_none=exclude_none))
