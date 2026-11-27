from ninja import Schema


class RegulatedProductOut(Schema):
    id: int
    name: str
    unit: str | None
