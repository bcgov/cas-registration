from typing import Optional, Tuple
from ._common import REPORT_TYPES, _Doc, _opinion_display

QUESTION = (
    "Does the VS have an opinion other than Unmodified, i.e., qualified, adverse, disclaimed, or "
    "modified opinions?"
)


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    rep = doc.opinions
    non_unmodified = [(rt, o) for rt, v in rep.items() for o in v["opinions"] if o != "Unmodified"]
    if non_unmodified:
        return "Yes — " + ", ".join(f"{rt.capitalize()}: {o}" for rt, o in non_unmodified), None
    incomplete = [
        (rt, _opinion_display(rep, rt))
        for rt in REPORT_TYPES
        if not rep.get(rt, {}).get("checked")
    ]
    if incomplete:
        return (
            "Cannot determine ("
            + "; ".join(f"{rt.capitalize()}: {st}" for rt, st in incomplete)
            + ")"
        ), None
    return "No", None
