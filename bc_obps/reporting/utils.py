from typing import Any


def validate_overlapping_records(
    object_class: Any,
    save_self: Any,
    exception_message: str,
) -> None:
    if hasattr(object_class, "source_type"):
        all_ranges = object_class.objects.select_related('valid_from', 'valid_to').filter(
            activity=save_self.activity, source_type=save_self.source_type
        )
    else:
        all_ranges = object_class.objects.select_related('valid_from', 'valid_to').filter(
            activity=save_self.activity
        )
    for y in all_ranges:
        if (
            (save_self.valid_from.valid_from >= y.valid_from.valid_from)
            and (save_self.valid_from.valid_from <= y.valid_to.valid_to)
        ) or (
            (save_self.valid_to.valid_to <= y.valid_to.valid_to)
            and (save_self.valid_to.valid_to >= y.valid_from.valid_from)
        ):
            raise Exception(exception_message)
