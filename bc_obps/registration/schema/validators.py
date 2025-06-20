from typing import Optional


def validate_cra_business_number(value: str) -> Optional[str]:
    """
    Validate that the cra_business_number has 9 digits.
    """
    if not (value.isdigit() and len(value) == 9):
        raise ValueError('CRA business number must be a 9-digit number.')
    return value
