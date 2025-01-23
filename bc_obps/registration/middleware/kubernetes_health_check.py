import logging
from typing import Callable
from django.http import HttpResponse, HttpResponseServerError, HttpRequest

logger = logging.getLogger("liveness")


class KubernetesHealthCheckMiddleware(object):
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if request.method == "GET":
            if request.path == "/readiness":
                return self.readiness()
            elif request.path == "/liveness":
                return self.liveness()
        return self.get_response(request)

    @staticmethod
    def liveness() -> HttpResponse:
        """
        Returns that the server is alive.
        """
        return HttpResponse("OK. Server is running.")

    @staticmethod
    def readiness() -> HttpResponse:
        # Connect to each database and do a generic standard SQL query
        # that doesn't write any data and doesn't depend on any tables
        # being present.
        try:
            from django.db import connections

            for name in connections:
                cursor = connections[name].cursor()
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                if row is None:
                    return HttpResponseServerError("db: invalid response")
        except Exception as e:
            logger.exception(e)
            return HttpResponseServerError("db: cannot connect to database.")

        # Call get_stats() to connect to each memcached instance and get it's stats.
        # This can effectively check if each is online.
        try:
            from django.core.cache import caches
            from django.core.cache.backends.memcached import BaseMemcachedCache

            for cache in caches.all():
                if isinstance(cache, BaseMemcachedCache):
                    stats = cache._cache.get_stats()  # type: ignore[attr-defined]
                    if len(stats) != len(cache._servers):  # type: ignore[attr-defined]
                        return HttpResponseServerError("cache: cannot connect to cache.")
        except Exception as e:
            logger.exception(e)
            return HttpResponseServerError("cache: cannot connect to cache.")

        return HttpResponse("OK. Server is ready.")
