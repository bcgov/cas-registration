from typing import Any


def _serialize_value(obj: Any) -> Any:
    """
    Serialize a value for storage in retry tasks.

    Args:
        obj: The object to serialize

    Returns:
        Serialized value that can be stored in JSON
    """
    if obj is None:
        return None
    elif isinstance(obj, (str, int, float, bool)):
        return obj
    elif isinstance(obj, (list, tuple)):
        return [_serialize_value(item) for item in obj]
    elif isinstance(obj, dict):
        return {str(k): _serialize_value(v) for k, v in obj.items()}
    else:
        # Try to convert to string for non-serializable objects
        try:
            return str(obj)
        except Exception as e:
            raise ValueError(f"Cannot serialize object of type {type(obj).__name__} for retry: {e}")
