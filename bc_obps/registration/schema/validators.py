import re


def validate_cra_business_number(value: str) -> str | None:
    """
    Validate that the cra_business_number has 9 digits.
    """
    if not re.fullmatch(r"\d{9}", value):
        raise ValueError("CRA business number must be a 9-digit number.")
    return value
