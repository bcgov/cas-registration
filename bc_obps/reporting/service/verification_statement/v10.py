import re
from typing import List, Optional, Tuple
from ._common import _Doc, _normalize

QUESTION = (
    "Are there any changes in the VS template that are recorded in Appendix B? If yes, do any of "
    "these changes impact compliance? Is the VS complete and no sections have been incorrectly removed?"
)

_SKIP_ROW = re.compile(
    r"modification to this template|section/subsection and page|rationale|add/delete rows",
    re.I,
)


def _appendix_b_rows(pages) -> List[str]:
    rows_out = []
    for _, text, tables in pages:
        if "appendix b" not in text.lower():
            continue
        for table in tables:
            for row in table:
                cells = [_normalize(c or "") for c in row]
                ne = [re.sub(r"\s+", " ", c).strip() for c in cells if c.strip()]
                if not ne:
                    continue
                joined = " | ".join(ne)
                if _SKIP_ROW.search(joined):
                    continue
                rows_out.append(joined)
    return rows_out


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    rows = _appendix_b_rows(doc.pages)
    note = (
        "Whether any recorded changes impact compliance, and whether the VS is complete (no sections "
        "incorrectly removed), is a reviewer judgment."
    )
    if not rows:
        return "No content found in Appendix B.", note
    return "\n".join(rows), note
