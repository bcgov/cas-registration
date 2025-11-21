# type: ignore
from datetime import datetime
from typing import Callable

from django.conf import settings
from django.http import HttpRequest, HttpResponse
import time_machine


class MockTimeMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:

        # Mocking time before processing
        if settings.ENVIRONMENT in ["local", "dev", "test"] and 'mock-time' in request.COOKIES:
            time_traveller = time_machine.travel(datetime.fromisoformat(request.COOKIES['mock-time']))
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
