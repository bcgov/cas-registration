from typing import Optional

from ninja import Schema


class RegulatedProductOut(Schema):
    id: int
    name: str
    unit: Optional[str]
