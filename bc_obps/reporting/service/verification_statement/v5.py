from typing import Optional, Tuple
from ._common import _Doc

QUESTION = "Is the verifier accredited and in good standing with the accreditation body?"


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    return "For future implementation.", None
