from typing import List, Optional
from enum import Enum
from ninja import Schema


class BodyType(str, Enum):
    HTML = "html"
    TEXT = "text"


class MessagePriority(str, Enum):
    HIGH = 'high'
    NORMAL = 'normal'
    LOW = 'low'


class AttachmentObject(Schema):
    content: str
    content_type: str
    encoding: Optional[str]
    filename: str


class ContextObject(Schema):
    bcc: Optional[List[str]]
    cc: Optional[List[str]]
    context: dict
    delayTS: Optional[int] = 0
    tag: Optional[str]
    to: List[str]


class EmailIn(Schema):
    attachments: Optional[List[AttachmentObject]] = []
    bcc: Optional[List[str]] = []
    bodyType: BodyType
    body: str
    cc: Optional[List[str]] = []
    delayTS: Optional[int] = 0
    encoding: Optional[str] = 'utf-8'
    send_from: str
    priority: Optional[MessagePriority]
    subject: str
    tag: Optional[str]
    to: List[str]


class TemplateMergeIn(Schema):
    attachments: Optional[List[AttachmentObject]] = []
    bodyType: BodyType
    body: str
    contexts: List[ContextObject]
    encoding: Optional[str] = 'utf-8'
    send_from: str
    priority: Optional[MessagePriority]
    subject: str
