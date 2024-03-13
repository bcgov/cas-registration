from typing import List, Optional
from enum import Enum


class BodyType(Enum):
    HTML = "html"
    TEXT = "text"


class MessagePriority(Enum):
    HIGH = 'high'
    NORMAL = 'normal'
    LOW = 'low'


class AttachmentObject:
    content: str
    content_type: str
    encoding: Optional[str]
    filename: str


class ContextObject:
    bcc: Optional[List[str]]
    cc: Optional[List[str]]
    context: dict
    delayTS: Optional[int] = 0
    tag: Optional[str]
    to: List[str]


class EmailOutData:
    attachments: Optional[List[AttachmentObject]]
    bcc: Optional[List[str]]
    bodyType: BodyType = 'text'
    body: str
    cc: Optional[List[str]]
    delayTS: Optional[int] = 0
    encoding: Optional[str]
    send_from: str
    priority: Optional[MessagePriority]
    subject: str
    tag: Optional[str]
    to: List[str]
