from typing import Optional, Tuple
from ._common import REPORT_TYPES, _Doc, _opinion_display

QUESTION = (
    "Does the VS have a verification opinion for the Emissions and/or Compliance Report?"
)


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    rep = doc.opinions
    return "\n".join(f"{rt.capitalize()}: {_opinion_display(rep, rt)}" for rt in REPORT_TYPES), None
