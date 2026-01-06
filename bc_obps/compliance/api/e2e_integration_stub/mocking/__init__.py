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

    This patch directly bypasses the _validate_config method to avoid needing real credentials.
    All HTTP requests will be intercepted by our HTTP-layer mocks regardless of config state.
    """
    from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient

    # Patch _validate_config to be a no-op, allowing the client to work without real credentials
    # HTTP requests will still be intercepted by our HTTP mocks
    with patch.object(BCCarbonRegistryAPIClient, "_validate_config", return_value=None):
        yield


@contextmanager
def e2e_sandbox() -> Iterator[None]:
    with (
        mock_external_http(),
        mock_bccr_client(),
    ):
        yield
