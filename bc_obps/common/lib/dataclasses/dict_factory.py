def _field_filter(obj, include: set = None, exclude_none: bool = False):
    """
    Helper function to include only specified fields from a dataclass in the output dict.
    """
    if include is not None and not isinstance(include, set):
        raise ValueError("The 'include' parameter must be a set of field names.")

    for field in obj:
        if include is not None and field[0] not in include:
            continue
        if exclude_none and field[1] is None:
            continue
        yield field


def dict_factory(include: set = None, exclude_none: bool = False):
    """
    Factory function that returns a function to include only specified fields in the output dict.
    """

    def factory_func(obj):
        return dict(_field_filter(obj, include, exclude_none))

    return factory_func
