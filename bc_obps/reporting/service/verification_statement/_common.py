import re
import unicodedata
from collections import Counter
from typing import List, Optional
import pypdfium2 as pdfium

OPINION_TYPES = ["Unmodified", "Modified", "Adverse", "Disclaimed", "Qualified"]
REPORT_TYPES = ("emissions", "compliance")

_MIN_WORDS_PER_TEXT_PAGE = 10
_MIN_TEXT_PAGE_FRACTION = 0.5

_MONTHS = (r"(?:January|February|March|April|May|June|July|August|September|"
           r"October|November|December)")
_DATE_RE = re.compile(
    rf"(?:\d{{1,2}}\s+{_MONTHS}\s+\d{{4}}|{_MONTHS}\s+\d{{1,2}},?\s+\d{{4}}|"
    rf"\d{{4}},?\s*{_MONTHS},?\s*\d{{1,2}}|\d{{4}}[,\-/]\s*\d{{1,2}}[,\-/]\s*\d{{1,2}}|"
    rf"\d{{1,2}}[,\-/]\s*\d{{1,2}}[,\-/]\s*\d{{4}})")


def _normalize(s: Optional[str]) -> str:
    """NFKC-normalise and repair the `ti`-ligature"""
    if not s:
        return ""
    return unicodedata.normalize("NFKC", s).replace("�", "ti")


def _page_text(page) -> str:
    return _normalize(page.extract_text() or "")


def _cells_text(table) -> str:
    return " ".join(_normalize(c) for row in table for c in row if c)


def has_text_layer(content: bytes) -> bool:
    """True if a majority of pages yield extractable text"""
    pdf = pdfium.PdfDocument(content)
    try:
        n = len(pdf)
        text_pages = 0
        for i in range(n):
            page = pdf[i]
            textpage = page.get_textpage()
            try:
                words = len(textpage.get_text_range().split())
            finally:
                textpage.close()
                page.close()
            if words >= _MIN_WORDS_PER_TEXT_PAGE:
                text_pages += 1
    finally:
        pdf.close()
    return (text_pages / max(n, 1)) >= _MIN_TEXT_PAGE_FRACTION

# ---- Opinion extraction — shared by V2 and V6 ----
def _context(text: str) -> str:
    low = text.lower()
    e, cmp = len(re.findall(r"emission", low)), len(re.findall(r"compliance", low))
    return "compliance" if cmp > e else "emissions" if e > cmp else "unknown"


def _opinion_label(cells) -> Optional[str]:
    return next((o for o in OPINION_TYPES if any(o.lower() == c.strip().lower() for c in cells)), None)


def _decision_mark(cells, label) -> Optional[str]:
    """The short Decision-cell glyph — the checkbox mark, whatever font it decodes to (☒, #, …)."""
    for c in cells:
        s = c.strip()
        if s and s.lower() != label.lower() and len(s) <= 2:
            return s
    return None


def _extract_opinions(pages) -> dict:
    """Per report type: the checked opinion, present-but-unchecked, or absent. Font-agnostic — within
    a section the modal Decision mark is 'unchecked' and the odd one out is the checked opinion."""
    rows = []
    for i, text, tables in pages:
        ctx = _context(text)
        for table in tables:
            for row in table:
                cells = [_normalize(c) for c in row if c]
                label = _opinion_label(cells)
                if label:
                    rows.append({"page": i, "context": ctx, "opinion": label,
                                 "mark": _decision_mark(cells, label)})
    by_report = {}
    for ctx in {r["context"] for r in rows}:
        section = [r for r in rows if r["context"] == ctx]
        marks = [r["mark"] for r in section if r["mark"]]
        selected = []
        if len(set(marks)) >= 2:
            unchecked = Counter(marks).most_common(1)[0][0]
            selected = [r for r in section if r["mark"] and r["mark"] != unchecked]
        by_report[ctx] = {"opinions": sorted({r["opinion"] for r in selected}), "checked": bool(selected)}
    return by_report


def _opinion_display(by_report: dict, report_type: str) -> str:
    section = by_report.get(report_type)
    if section is None:
        return "Not available"
    if section["checked"]:
        return ", ".join(section["opinions"])
    return "Not answered"


class _Doc:
    """A parsed VS: pages (1-based index, text, tables), whole-doc text, and the consolidated opinions.
    Tables are extracted once here so each criterion reuses them without re-parsing."""

    def __init__(self, pdf):
        self.pdf = pdf
        self.pages: List = [(i, _page_text(p), p.extract_tables()) for i, p in enumerate(pdf.pages, start=1)]
        self.full_text: str = "\n".join(t for _, t, _ in self.pages)
        self.opinions: dict = _extract_opinions(self.pages)
