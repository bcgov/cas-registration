from typing import Optional

from registration.utils import data_url_to_file
from django.core.files.base import ContentFile


def validate_cra_business_number(value: int) -> Optional[int]:
    """
    Validate that the cra_business_number has 9 digits.
    """
    if not (isinstance(value, int) and 100000000 <= value <= 999999999):
        raise ValueError('CRA business number must be a 9-digit number.')
    return value