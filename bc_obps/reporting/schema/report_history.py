from ninja import ModelSchema, Schema
from pydantic import BaseModel
from typing import List, Optional

from reporting.models import ReportVersion


class ReportHistoryResponse(ModelSchema):
    class Meta:
        model = ReportVersion
        fields = ["id", "updated_at", "status","report_type"]
    report_id: int
    name: Optional[str] = None
    version: Optional[str] = None


class ReportOperation(Schema):
    operation: str
