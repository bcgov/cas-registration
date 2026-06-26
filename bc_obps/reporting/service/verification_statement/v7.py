from typing import Optional, Tuple
from ._common import _Doc

QUESTION = (
    "Do the emissions and production numbers in the VS match the corresponding numbers in the "
    "Annual Report?"
)


def answer(doc: _Doc) -> Tuple[str, Optional[str]]:
    return (
        "Planned — answering this requires comparing the VS numbers against the operation's Annual "
        "Report numbers in BCIERS, which is not yet integrated.",
        None,
    )
