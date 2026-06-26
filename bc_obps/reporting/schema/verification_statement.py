from typing import Optional

from ninja import Schema


class CriterionResultOut(Schema):
    """One A4 VS-check criterion answered for an uploaded verification statement."""

    code: str
    question: str
    answer: str
    note: Optional[str] = None
