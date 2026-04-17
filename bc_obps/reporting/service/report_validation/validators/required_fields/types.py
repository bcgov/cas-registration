from typing import Literal, TypedDict


class RequiredFieldConfig(TypedDict):
    """
    Configuration for validating required fields in report_validation validators.

    - field: attribute name on the model or logical field identifier
    - label: human-readable name used in error messages
    - field_type:
        - "scalar": simple field
        - "m2m": many-to-many relationship
        - "custom": validated using custom logic
    """

    field: str
    label: str
    field_type: Literal["scalar", "m2m", "custom"]
