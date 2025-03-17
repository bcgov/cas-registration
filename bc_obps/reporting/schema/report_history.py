from ninja import ModelSchema
from pydantic import BaseModel
from typing import List, Optional

from reporting.models import ReportVersion


class ReportHistoryResponse(ModelSchema):
    class Meta:
        model = ReportVersion
        fields = ["id", "updated_at", "status","report_type"]
    report_id: int
    updated_by_firstname: Optional[str]
    updated_by_lastname: Optional[str]
