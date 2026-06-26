import re
from typing import List, Optional, Tuple
from ._common import _Doc, _cells_text, _normalize

QUESTION = "Are there any (material and/or immaterial) findings that may impact compliance?"

_FINDINGS_HEADER = re.compile(
    r"identified error|material/immaterial|resolution|unresolved absolute|omission or|^misstatement$",
    re.I,
)
_FINDINGS_BOUNDARY = re.compile(r"summary of misstatement|opportunit(y|ies)", re.I)


def _materiality_entries(pages) -> List[str]:
    entries = []
    for _, text, tables in pages:
        if "material/immaterial" not in text.lower():
            continue
        for table in tables:
            if "material/immaterial" not in _cells_text(table).lower():
                continue
            for row in table:
                cells = [_normalize(c or "") for c in row]
                ne = [c.strip() for c in cells if c.strip()]
                if not ne:
                    continue
                if _FINDINGS_BOUNDARY.search(" ".join(ne)):
                    break
                # Skip header rows
                if all(_FINDINGS_HEADER.search(c) for c in ne):
                    continue
                # Material/Immaterial is always column index 1 in data rows
                if len(cells) > 1 and cells[1].strip():
                    entries.append(re.sub(r"\s+", " ", cells[1]).strip())
    return entries


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    entries = _materiality_entries(doc.pages)
    note = (
        "We report the Material/Immaterial column verbatim; whether findings may impact "
        "compliance is a reviewer judgment."
    )
    if not entries:
        return "No findings table detected or Material/Immaterial column is empty.", note
    return "\n".join(entries), note
