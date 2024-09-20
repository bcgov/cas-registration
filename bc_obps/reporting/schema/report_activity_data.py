from typing import Any
from ninja import Schema
from pydantic import Json


class ReportActivityDataIn(Schema):
    activity_data: Json[Any]
