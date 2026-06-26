import re
from typing import Dict, List, Optional, Tuple
from collections import Counter
from ._common import (
    _DATE_RE, _Doc, _cells_text, _normalize
)

QUESTION = (
    "Are required reported fields in the VS completed, including date of submission, emissions "
    "and production numbers, verification scope and procedures, conflict of interest forms, and "
    "declaration?"
)

# ---- Submission date ----

def _submission_date(full: str) -> Optional[str]:
    lines = full.splitlines()
    for i, ln in enumerate(lines):
        if re.search(r"submission date", ln, re.I):
            m = _DATE_RE.search(" ".join(lines[max(0, i - 1):i + 2]))
            if m:
                return m.group(0)
    return None


# ---- Verification Scope (sections 3.1.2 / 4.1.2) ----
def _parse_scope_cell(cell_text: str) -> Optional[str]:
    """Return the selected scope description from a multi-line scope cell value."""
    items: List[tuple] = []
    for ln in cell_text.split("\n"):
        ln = ln.strip()
        if not ln or re.search(r"please indicate|select.{0,10}following", ln, re.I):
            continue
        # Checkbox line: starts with a non-alpha, non-digit character (the mark glyph)
        if not ln[0].isalpha() and not ln[0].isdigit():
            text = ln[1:].strip()
            if text:
                items.append((ln[0], text))
        elif items:
            # Continuation of the previous option (wrapped line)
            items[-1] = (items[-1][0], items[-1][1] + " " + ln)

    if not items:
        return None

    marks = [m for m, _ in items]
    if len(set(marks)) >= 2:
        # Font-agnostic: minority mark = the checked one
        modal = Counter(marks).most_common(1)[0][0]
        checked = [t for m, t in items if m != modal]
        return checked[0] if checked else None

    # Unanimous marks — only act if it's the Unicode checked-box character
    if marks[0] == "☒":
        return items[0][1]
    return None


def _extract_scope(pages) -> Dict[str, Optional[str]]:
    """Extract the checked scope option per report type from sections 3.1.2 / 4.1.2."""
    result: Dict[str, Optional[str]] = {}
    for _, text, tables in pages:
        if "scope" not in text.lower():
            continue
        for table in tables:
            for row in table:
                cells = [_normalize(c or "") for c in row]
                ne = [c.strip() for c in cells if c.strip()]
                if len(ne) < 2 or not re.search(r"^scope of this verification", ne[0], re.I):
                    continue
                value = ne[1]
                ctx = "compliance" if re.search(r"\bcompliance report\b", value, re.I) else "emissions"
                if ctx not in result:
                    selected = _parse_scope_cell(value)
                    if selected:
                        result[ctx] = selected
    return result


# ---- Conflict of Interest form ----
def _extract_coi(pages, pdf) -> Dict[str, Optional[str]]:
    name_title: Optional[str] = None
    date_val: Optional[str] = None

    for _, text, tables in pages:
        if "conflict of interest" not in text.lower():
            continue
        for table in tables:
            flat = _cells_text(table).lower()
            if "signatory" not in flat and "conflict" not in flat:
                continue
            for row in table:
                cells = [_normalize(c or "") for c in row]
                non_empty = [c.strip() for c in cells if c.strip()]
                if not non_empty:
                    continue
                first = non_empty[0]
                # Name/title: label in col-0, value in col-1
                if re.search(r"name and title of the|verification body signatory", first, re.I) and len(non_empty) >= 2:
                    val = non_empty[1]
                    if not re.search(r"\[.*\]", val):
                        name_title = name_title or val
                # Date row (with or without colon)
                if re.search(r"^date:?$", first, re.I) and len(non_empty) >= 2:
                    m = _DATE_RE.search(non_empty[1])
                    if m:
                        date_val = m.group(0)

    return {"name_title": name_title, "date": date_val}


# ---- Declaration tables ----
def _is_lead_verifier_table(table) -> bool:
    for row in table:
        cells = [_normalize(c or "") for c in row]
        ne = [c.strip() for c in cells if c.strip()]
        if ne and re.search(r"^lead verifier$", ne[0], re.I):
            return True
    return False


def _is_ipr_table(table) -> bool:
    """IPR tables have a single-cell 'Name and Title' label row (not 'Name and Title of the …')."""
    for row in table:
        cells = [_normalize(c or "") for c in row]
        ne = [c.strip() for c in cells if c.strip()]
        if len(ne) == 1 and re.search(r"^name and title$", ne[0], re.I):
            return True
    return False


def _extract_lead_verifier(table) -> Optional[Dict[str, Optional[str]]]:
    rows = [[_normalize(c or "") for c in row] for row in table]
    name: Optional[str] = None
    date_val: Optional[str] = None

    for i, row in enumerate(rows):
        ne = [c.strip() for c in row if c.strip()]
        if not ne:
            continue
        first = ne[0]

        if re.search(r"^lead verifier$", first, re.I) and len(ne) >= 2:
            val = ne[1]
            if not re.search(r"\[.*\]|regulation", val, re.I):
                name = val

        # Date in same row
        if re.search(r"^date$", first, re.I) and len(ne) >= 2:
            m = _DATE_RE.search(ne[1])
            if m:
                date_val = m.group(0)
        # Date inverted (value row before 'Date' label row)
        elif re.search(r"^date$", first, re.I) and len(ne) == 1 and i > 0:
            prev = [c.strip() for c in rows[i - 1] if c.strip()]
            if prev:
                m = _DATE_RE.search(prev[0])
                if m:
                    date_val = m.group(0)
        # Stand-alone date value row (TOL-HEF: date then 'Date' label on next row)
        elif not date_val and len(ne) == 1 and i + 1 < len(rows):
            m = _DATE_RE.fullmatch(first) or _DATE_RE.search(first)
            if m and not re.search(r"lead|regulation|signature", first, re.I):
                next_ne = [c.strip() for c in rows[i + 1] if c.strip()]
                if next_ne and re.search(r"^date$", next_ne[0], re.I):
                    date_val = m.group(0)

    if name or date_val:
        return {"name": name, "date": date_val}
    return None


def _extract_ipr(table) -> Optional[Dict[str, Optional[str]]]:
    rows = [[_normalize(c or "") for c in row] for row in table]
    flat = [[c.strip() for c in row if c.strip()] for row in rows]
    flat = [r for r in flat if r]

    name_title: Optional[str] = None
    date_val: Optional[str] = None

    for i, row in enumerate(flat):
        if len(row) == 1 and re.search(r"^name and title$", row[0], re.I) and i > 0:
            val = flat[i - 1][0] if flat[i - 1] else None
            if val and not re.search(r"\[.*\]", val):
                name_title = val
        if len(row) == 1 and re.search(r"^date$", row[0], re.I) and i > 0:
            m = _DATE_RE.search(flat[i - 1][0]) if flat[i - 1] else None
            if m:
                date_val = m.group(0)

    if name_title or date_val:
        return {"name_title": name_title, "date": date_val}
    return None


def _extract_declarations(pages) -> Dict:
    lead_verifiers: List[Dict] = []
    ipr_entries: List[Dict] = []
    seen_lead: set = set()
    seen_ipr: set = set()

    for _, text, tables in pages:
        low = text.lower()
        has_lead = re.search(r"declaration.*lead verifier|lead verifier.*declaration", low)
        has_ipr = re.search(r"declaration.*independent peer|independent peer.*reviewer", low)

        if not has_lead and not has_ipr:
            continue

        for table in tables:
            if has_lead and _is_lead_verifier_table(table):
                entry = _extract_lead_verifier(table)
                if entry:
                    key = (entry.get("name"), entry.get("date"))
                    if key not in seen_lead and not re.search(r"\[.*\]", str(entry.get("name") or "")):
                        seen_lead.add(key)
                        lead_verifiers.append(entry)

            if has_ipr and _is_ipr_table(table):
                entry = _extract_ipr(table)
                if entry:
                    key = (entry.get("name_title"), entry.get("date"))
                    if key not in seen_ipr and not re.search(r"\[.*\]", str(entry.get("name_title") or "")):
                        seen_ipr.add(key)
                        ipr_entries.append(entry)

    return {"lead_verifiers": lead_verifiers, "ipr_entries": ipr_entries}


# ---- Answer ----

def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    date = _submission_date(doc.full_text)
    scope = _extract_scope(doc.pages)
    coi = _extract_coi(doc.pages, doc.pdf)
    decl = _extract_declarations(doc.pages)

    lines = []
    missing = []

    # Date of submission
    lines.append(f"Date of submission: {date or 'Not found'}")
    if not date:
        missing.append("Date of submission")

    # Verification Scope (scope checkboxes from sections 3.1.2 / 4.1.2)
    for ctx_key, ctx_label in [("emissions", "Emissions"), ("compliance", "Compliance")]:
        val = scope.get(ctx_key)
        lines.append(f"Verification Scope – {ctx_label}: {val or 'Not found'}")

    # Conflict of Interest
    if coi.get("name_title") or coi.get("date"):
        parts = []
        if coi["name_title"]:
            parts.append(f"Signatory: {coi['name_title']}")
        if coi["date"]:
            parts.append(f"Date: {coi['date']}")
        lines.append(f"COI form – {' | '.join(parts)}")
    else:
        lines.append("COI form: Not found")
        missing.append("Conflict of interest form")

    # Lead Verifier declarations
    if decl["lead_verifiers"]:
        for lv in decl["lead_verifiers"]:
            val = lv.get("name") or "Name not found"
            if lv.get("date"):
                val += f" | Date: {lv['date']}"
            lines.append(f"Lead Verifier: {val}")
    else:
        lines.append("Lead Verifier declaration: Not found")
        missing.append("Lead Verifier declaration")

    # IPR declarations
    if decl["ipr_entries"]:
        for ipr in decl["ipr_entries"]:
            val = ipr.get("name_title") or "Name not found"
            if ipr.get("date"):
                val += f" | Date: {ipr['date']}"
            lines.append(f"Independent Peer Reviewer: {val}")
    else:
        lines.append("Independent Peer Reviewer declaration: Not found")
        missing.append("Independent Peer Reviewer declaration")

    answer_str = "\n".join(lines)
    if missing:
        answer_str += f"\n\nMissing: {', '.join(missing)}"

    note = (
        "Presence and extracted values only — whether each field is adequately completed "
        "is a reviewer judgment."
    )
    return answer_str, note
