import re
from typing import List, Optional, Tuple
from ._common import _Doc, _cells_text, _normalize

QUESTION = "Did the site visit comply with GGERR requirements?"

_SKIP_LABEL = re.compile(
    r"^(site visit process|description|instructions to verifier|please provide|"
    r"note:|section/subsection|heading)$",
    re.I,
)


def _ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def _site_visit_rows(pages) -> List[str]:
    for _, text, tables in pages:
        if "site visit process" not in text.lower():
            continue
        for table in tables:
            if "site visit" not in _cells_text(table).lower():
                continue
            rows_out = []
            for row in table:
                cells = [_normalize(c or "") for c in row]
                ne = [_ws(c) for c in cells if c.strip()]
                if len(ne) < 2:
                    continue
                # Strip trailing citation suffixes: "Regulation s. …" and "IAF MD4: …"
                label = re.split(r"\s+[Rr]egulation\b|\s+IAF\s+MD", ne[0])[0].strip()
                if _SKIP_LABEL.match(label):
                    continue
                rows_out.append(f"{label}: {ne[1]}")
            if rows_out:
                return rows_out
    return []


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    rows = _site_visit_rows(doc.pages)
    note = (
        "We surface the site-visit details stated in the VS; whether the visit met GGERR "
        "requirements is a reviewer judgment."
    )
    if not rows:
        return "Site-visit information not found.", note
    return "\n".join(rows), note
