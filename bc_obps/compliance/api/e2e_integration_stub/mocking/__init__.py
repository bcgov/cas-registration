from contextlib import contextmanager
from typing import Iterator
from unittest.mock import patch
from .http_mocks import mock_external_http, UnmockedExternalCall


__all__ = [
    "e2e_sandbox",
    "UnmockedExternalCall",
    "mock_external_http",
]


@contextmanager
def mock_bccr_client() -> Iterator[None]:
    """Patch BCCR client to bypass configuration validation.

    BCCR client validates credentials before making HTTP requests and raises an error
    if api_url/client_id/client_secret are missing. This prevents HTTP-layer mocks from working.

    eLicensing client doesn't validate - it directly makes HTTP requests even with None values,
    so HTTP-layer mocking is sufficient (URLs like "None/client" get intercepted by our mocks).

    This patch provides dummy config values so BCCR client passes validation and makes HTTP
    requests that our HTTP-layer mocks can intercept.
    """
    from django.conf import settings
    from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient

    # Clear singleton instance so it gets recreated with patched settings
    original_instance = BCCarbonRegistryAPIClient._instance
    BCCarbonRegistryAPIClient._instance = None

    try:
        with (
            patch.object(settings, "BCCR_API_URL", "http://bccr-mock.local"),
            patch.object(settings, "BCCR_CLIENT_ID", "e2e-test-client"),
            patch.object(settings, "BCCR_CLIENT_SECRET", "e2e-test-secret"),
        ):
            yield
    finally:
        # Restore original singleton instance
        BCCarbonRegistryAPIClient._instance = original_instance


@contextmanager
def e2e_sandbox() -> Iterator[None]:
    with (
        mock_external_http(),
        mock_bccr_client(),
    ):
        yield
