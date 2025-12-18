import os
import re
import json
from contextlib import contextmanager
from typing import Any, Callable, Iterator, Optional

import requests
from requests import Response
from unittest.mock import patch

__all__ = [
    "e2e_sandbox",
    "UnmockedExternalCall",
    "mock_external_http",
]


class UnmockedExternalCall(RuntimeError):
    """Raised when code tries to call an external system that isn't mocked in E2E sandbox."""


# -------------------------------------------------------------------
# Helpers for building mocked responses
# -------------------------------------------------------------------
def json_response(status: int, payload: dict, url: str) -> Response:
    resp = Response()
    resp.status_code = status
    resp._content = json.dumps(payload).encode("utf-8")
    resp.headers["Content-Type"] = "application/json"
    resp.url = url
    return resp


def is_local_url(url: str) -> bool:
    # Treat these as "local" so they can pass through if needed
    return any(
        url.startswith(prefix)
        for prefix in (
            "http://localhost",
            "http://127.0.0.1",
            "http://0.0.0.0",
            "http://app",
            "http://web",
            "http://django",
        )
    )


def base_url(setting_name: str) -> Optional[str]:
    from django.conf import settings

    val = getattr(settings, setting_name, None)
    if not val:
        return None
    return str(val).rstrip("/")


# -------------------------------------------------------------------
# Mock payloads that must satisfy response models
# -------------------------------------------------------------------
E2E_PROJECT_DETAILS: dict[str, Any] = {
    # ProjectDetailsResponse required fields
    "id": 104100000030325,
    "account_id": 103100000028575,
    "project_name": "E2E Test Project",
    "project_description": "E2E Test Project Description",
    # Required by credit_issuance_service.issue_credits
    "mixedUnitList": [
        {
            "id": 103200000392481,  # used as defined_unit_id
            "project_type_id": 140000000000002,
            # LFO-style fields
            "city": "Vancouver",
            "address_line_1": "E2E Address",
            "zipcode": "H0H0H0",
            "province": "BC",
            # SFO-style fields (as strings in your service)
            "latitude": "49.2827",
            "longitude": "-123.1207",
            # Period fields
            "period_start_date": "2025-01-01",
            "period_end_date": "2025-12-31",
        }
    ],
}


# -------------------------------------------------------------------
# HTTP Mock registry
# Each entry: (regex_pattern, HTTP_method, handler(url)->Response)
# -------------------------------------------------------------------
ELICENSING_MOCKS: list[tuple[str, str, Callable[[str], Response]]] = [
    (
        r"/client$",
        "POST",
        lambda url: json_response(
            200,
            {"clientObjectId": 123, "clientGUID": "00000000-0000-0000-0000-000000000000"},
            url,
        ),
    ),
    (
        r"/client/\d+/fees$",
        "POST",
        lambda url: json_response(
            200,
            {
                "clientObjectId": 123,
                "clientGUID": "00000000-0000-0000-0000-000000000000",
                "fees": [{"feeGUID": "11111111-1111-1111-1111-111111111111", "feeObjectId": 999}],
            },
            url,
        ),
    ),
    (
        r"/client/\d+/invoice$",
        "POST",
        lambda url: json_response(
            200,
            {
                "clientObjectId": 123,
                "businessAreaCode": "E2E",
                "clientGUID": "00000000-0000-0000-0000-000000000000",
                "invoiceNumber": "INV-999",
            },
            url,
        ),
    ),
    (
        r"/client/\d+/invoice$",
        "GET",
        lambda url: json_response(
            200,
            {
                "clientObjectId": 123,
                "clientGUID": "00000000-0000-0000-0000-000000000000",
                "invoiceNumber": "INV-999",
                "invoicePaymentDueDate": "2025-12-31",
                "invoiceOutstandingBalance": "0.00",
                "invoiceFeeBalance": "0.00",
                "invoiceInterestBalance": "0.00",
                "fees": [
                    {
                        "feeObjectId": 999,
                        "feeGUID": "11111111-1111-1111-1111-111111111111",
                        "businessAreaCode": "E2E",
                        "feeDate": "2025-12-18",
                        "description": "E2E Test Fee",
                        "baseAmount": "100.00",
                        "taxTotal": "0.00",
                        "adjustmentTotal": "0.00",
                        "taxAdjustmentTotal": "0.00",
                        "paymentBaseAmount": "100.00",
                        "paymentTotal": "100.00",
                        "invoiceNumber": "INV-999",
                        "payments": [],
                        "adjustments": [],
                    }
                ],
            },
            url,
        ),
    ),
]

BCCR_MOCKS: list[tuple[str, str, Callable[[str], Response]]] = [
    (
        r"/user-api/okta/token$",
        "POST",
        lambda url: json_response(
            200,
            {"access_token": "e2e-test-token", "expires_in": 3600, "token_type": "Bearer"},
            url,
        ),
    ),
    (
        r"/raas-report-api/es/account/pagePrivateSearchByFilter$",
        "POST",
        lambda url: json_response(
            200,
            {
                "totalEntities": 1,
                "totalPages": 1,
                "numberOfElements": 1,
                "first": True,
                "last": True,
                "entities": [
                    {
                        "id": "999_140000000000001",
                        "entityId": 999,
                        "standardId": 140000000000001,
                        "standardName": "BC Carbon Registry",
                        "accountId": 999,
                        "accountName": "E2E Test Account",
                        "tradingName": "E2E Test Account",
                        "organizationClassificationId": "100000000000001",
                        "type_of_account_holder": "Corporation",
                        "accountTypeId": 11,
                    }
                ],
            },
            url,
        ),
    ),
    (
        r"/raas-project-api/project-manager/doSubmit$",
        "POST",
        lambda url: json_response(200, E2E_PROJECT_DETAILS, url),
    ),
    (
        r"/raas-project-api/project-manager/getById/\d+(?:/)?(?:\?.*)?$",
        "GET",
        lambda url: json_response(200, E2E_PROJECT_DETAILS, url),
    ),
    (
        r"/br-reg/rest/market-issuance-manager/doSubmit$",
        "POST",
        lambda url: json_response(200, {"id": "E2E-ISSUANCE-1"}, url),
    ),
]

API_MOCKS: list[tuple[str, list[tuple[str, str, Callable[[str], Response]]], str]] = [
    ("eLicensing", ELICENSING_MOCKS, "ELICENSING_API_URL"),
    ("BCCR", BCCR_MOCKS, "BCCR_API_URL"),
]


def match_endpoint(
    url: str, method: str, mocks: list[tuple[str, str, Callable[[str], Response]]]
) -> Optional[Response]:
    for pattern, expected_method, handler in mocks:
        if method == expected_method and re.search(pattern, url):
            return handler(url)
    return None


def try_mock_response(url: str, method: str) -> Optional[Response]:
    for _service_name, patterns, _setting in API_MOCKS:
        response = match_endpoint(url, method, patterns)
        if response is not None:
            response.url = url
            return response
    return None


# -------------------------------------------------------------------
# HTTP-layer interception
# -------------------------------------------------------------------
@contextmanager
def mock_external_http() -> Iterator[None]:
    """Block external HTTP and return mocked responses for eLicensing/BCCR"""
    real_session_request = requests.sessions.Session.request
    real_requests_request = requests.api.request

    def dispatch(method: str, url: str, **_kwargs: Any) -> Optional[Response]:
        m = method.upper()

        response = try_mock_response(url, m)
        if response is not None:
            return response

        if url.startswith(("http://", "https://")) and not is_local_url(url):
            for service_name, _patterns, setting in API_MOCKS:
                api_base = base_url(setting)
                if api_base and url.startswith(api_base):
                    msg = f"[E2E HTTP UNMOCKED] {service_name} {m} {url} (base={api_base})"
                    raise UnmockedExternalCall(msg)

            msg = f"[E2E HTTP BLOCKED] {m} {url}"
            raise UnmockedExternalCall(msg)

        return None

    def patched_session_request(self: requests.Session, method: str, url: str, **kwargs: Any) -> Response:
        resp = dispatch(method, url, **kwargs)
        return resp if resp is not None else real_session_request(self, method, url, **kwargs)

    def patched_requests_request(method: str, url: str, **kwargs: Any) -> Response:
        resp = dispatch(method, url, **kwargs)
        return resp if resp is not None else real_requests_request(method, url, **kwargs)

    with (
        patch.object(requests.sessions.Session, "request", patched_session_request),
        patch.object(requests.api, "request", patched_requests_request),
    ):
        yield


# -------------------------------------------------------------------
# Sandbox entrypoint used by the e2e integration stub endpoint
# -------------------------------------------------------------------
@contextmanager
def e2e_sandbox() -> Iterator[None]:
    """
    E2E sandbox:
    - blocks/mocks outbound HTTP to eLicensing/BCCR at the requests layer
    - bypasses BCCR config validation so CI doesn't require real credentials
    - ensures BCCR api_url is non-None to build normal-looking URLs
    """
    from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient

    with (
        mock_external_http(),
        patch.object(BCCarbonRegistryAPIClient, "_validate_config", return_value=None),
    ):
        BCCarbonRegistryAPIClient._instance = None
        client = BCCarbonRegistryAPIClient()
        client.api_url = os.getenv("E2E_BCCR_API_URL", "http://bccr-mock.local")

        yield

        BCCarbonRegistryAPIClient._instance = None
