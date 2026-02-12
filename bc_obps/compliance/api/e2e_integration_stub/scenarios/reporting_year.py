from django.utils import timezone
from django.utils.dateparse import parse_datetime
from typing import Any, Dict
from django.http import HttpRequest

from ..schemas import ScenarioPayload
from .base import ScenarioHandler


class GetReportingYearScenario(ScenarioHandler):
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        payload = data.payload or {}

        # if "reporting_year" not in payload:
        #     raise ValueError("payload.reporting_year is required")
        # if "report_due_date" not in payload:
        #     raise ValueError("payload.report_due_date is required")
        # if "reporting_window_end" not in payload:
        #     raise ValueError("payload.reporting_window_end is required")
        # if "report_open_date" not in payload:
        #     raise ValueError("payload.report_open_date is required")

        reporting_year = payload.get("reporting_year")
        report_due_date = payload.get("report_due_date")
        reporting_window_end = payload.get("reporting_window_end")
        report_open_date = payload.get("report_open_date")

        now = timezone.now()
        # is_open = now > report_open_date
        
        # return {
        #     "reporting_year": reporting_year,
        #     "report_due_date": report_due_date,
        #     "reporting_window_end": reporting_window_end,
        #     "report_open_date": report_open_date,
        #     "is_reporting_open": is_open,
        # }
        return {
            "reporting_year": 2025,
            "report_due_date": "2028-05-31T23:59:59.999Z",
            "reporting_window_end": "2026-12-31T23:59:59.999Z",
            "report_open_date": "2026-01-01T00:00:00.000Z",
            "is_reporting_open": True,
        }

