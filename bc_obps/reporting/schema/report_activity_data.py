from typing import Dict
from ninja import Schema


class ReportActivityDataIn(Schema):
    activity_data: Dict
