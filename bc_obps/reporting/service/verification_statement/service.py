import io
import json
from typing import Generator
import pdfplumber
from ._common import _Doc, has_text_layer
from . import v2, v3, v4, v5, v6, v7, v8, v10

# Each entry: (criterion code, question text, answer function).
# The answer function receives a _Doc and returns (answer: str, note: str | None).
CRITERIA = [
    ("V2", v2.QUESTION, v2.answer),
    ("V3", v3.QUESTION, v3.answer),
    ("V4", v4.QUESTION, v4.answer),
    ("V5", v5.QUESTION, v5.answer),
    ("V6", v6.QUESTION, v6.answer),
    ("V7", v7.QUESTION, v7.answer),
    ("V8", v8.QUESTION, v8.answer),
    ("V10", v10.QUESTION, v10.answer),
]


_NOT_PARSEABLE_REASON = (
    "This PDF has no usable text layer (scanned image or vector-outline text); "
    "it needs manual review."
)
_BAD_PDF_REASON = (
    "Could not read this file as a PDF. Please upload a valid PDF verification statement."
)


def analyze_stream(content: bytes) -> Generator[str, None, None]:
    """Yield NDJSON lines for each stage: ready → criteria one by one.

    Allows the frontend to show criteria progressively as the PDF is parsed and each
    criterion is evaluated, rather than waiting for the full response.
    """
    if not has_text_layer(content):
        yield json.dumps({"type": "error", "parseable": False, "reason": _NOT_PARSEABLE_REASON}) + "\n"
        return
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            doc = _Doc(pdf)
            yield json.dumps({"type": "ready", "parseable": True}) + "\n"
            for code, question, fn in CRITERIA:
                criterion_answer, note = fn(doc)
                yield json.dumps({
                    "type": "criterion",
                    "code": code,
                    "question": question,
                    "answer": criterion_answer,
                    "note": note,
                }) + "\n"
    except Exception:
        yield json.dumps({"type": "error", "parseable": False, "reason": _BAD_PDF_REASON}) + "\n"


