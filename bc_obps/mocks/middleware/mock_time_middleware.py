# type: ignore
from datetime import datetime
from typing import Callable

from django.conf import settings
from django.db import connection
from django.http import HttpRequest, HttpResponse
import time_machine


class MockTimeMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        print(
            """
-- Initializing Time Mock Middleware
   in any API request, set the 'mock-time' cookie
   to any ISO timestamp to override server and database time
"""
        )

        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:

        print(
            f"""
-- Time Mock Middleware: found time {request.COOKIES.get("mock-time", "None")}
"""
        )

        # Mocking time before processing
        if settings.ENVIRONMENT in ["local", "dev", "test"] and 'mock-time' in request.COOKIES:
            datetime_iso_str = request.COOKIES['mock-time']
            self.set_database_time_for_session(datetime_iso_str)

            time_traveller = time_machine.travel(datetime.fromisoformat(datetime_iso_str))
            request.time_traveller = time_traveller
            request.time_traveller.start()
        else:
            request.time_traveller = None

        # Down the middleware stack
        response = self.get_response(request)

        # Reverting time mock
        if request.time_traveller:
            request.time_traveller.stop()

        return response

    def set_database_time_for_session(self, datetime_iso_str: str) -> None:
        with connection.cursor() as cursor:
            cursor.execute("select mocks.set_mocked_time_in_transaction(%s::timestamptz);", [datetime_iso_str])
