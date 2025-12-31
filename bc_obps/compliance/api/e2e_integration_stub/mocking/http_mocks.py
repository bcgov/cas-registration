import re
from contextlib import contextmanager
from typing import Any, Callable, Iterator, Optional
from unittest.mock import patch
import requests
from requests.models import Response
from ..utils import base_url, is_local_url, json_response


class UnmockedExternalCall(RuntimeError):
    """Raised when code tries to call an external system not mocked in E2E sandbox."""

    pass


ELICENSING_MOCKS: list[tuple[str, str, Callable[[str], Response]]] = [
    (
        r"/client$",
        "POST",
        lambda url: json_response(
            200,
            {
                "clientObjectId": 123,
                "clientGUID": "00000000-0000-0000-0000-000000000000",
            },
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
                "fees": [
                    {
                        "feeGUID": "11111111-1111-1111-1111-111111111111",
                        "feeObjectId": 999,
                    }
                ],
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
                "clientObjectId": "123",
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
                "clientObjectId": "123",
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

E2E_PROJECT_DETAILS = {
    "id": 104100000030325,
    "account_id": 103100000028575,
    "project_name": "E2E Test Project",
    "project_description": "E2E Test Project Description",
    "mixedUnitList": [
        {
            "id": 103200000392481,
            "project_type_id": 140000000000002,
            # LFO-style address fields
            "city": "Vancouver",
            "address_line_1": "E2E Address",
            "zipcode": "H0H0H0",
            "province": "BC",
            # SFO-style coordinates (your service uses str(lat/long))
            "latitude": "49.2827",
            "longitude": "-123.1207",
            # period fields used by issuance payload
            "period_start_date": "2025-01-01",
            "period_end_date": "2025-12-31",
        }
    ],
}


BCCR_MOCKS: list[tuple[str, str, Callable[[str], Response]]] = [
    (
        r"/user-api/okta/token$",
        "POST",
        lambda url: json_response(
            200,
            {
                "access_token": "e2e-test-token",
                "expires_in": 3600,
                "token_type": "Bearer",
            },
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
        r"/br-reg/rest/market-issuance-manager/doSubmit$",
        "POST",
        lambda url: json_response(200, {"id": "E2E-ISSUANCE-1"}, url),
    ),
    (
        r"/raas-project-api/project-manager/getById/\d+(?:/)?(?:\?.*)?$",
        "GET",
        lambda url: json_response(
            200,
            E2E_PROJECT_DETAILS,
            url,
        ),
    ),
]


API_MOCKS = [
    ("eLicensing", ELICENSING_MOCKS, "ELICENSING_API_URL"),
    ("BCCR", BCCR_MOCKS, "BCCR_API_URL"),
]


def match_endpoint(
    url: str, method: str, mocks: list[tuple[str, str, Callable[[str], Response]]]
) -> Optional[Response]:
    """Match URL and method against registered mocks using regex patterns."""
    for pattern, expected_method, handler in mocks:
        if method == expected_method and re.search(pattern, url):
            return handler(url)
    return None


def try_mock_response(url: str, method: str) -> Optional[Response]:
    """Try to match URL against all registered API mocks."""
    for service_name, patterns, _ in API_MOCKS:
        response = match_endpoint(url, method, patterns)
        if response is not None:
            response.url = url
            return response
    return None


@contextmanager
def mock_external_http() -> Iterator[None]:
    """Block external HTTP and return mocked responses for eLicensing/BCCR."""
    real_session_request = requests.sessions.Session.request
    real_requests_request = requests.api.request

    def dispatch(method: str, url: str, **_kwargs: Any) -> Optional[Response]:
        # Try pattern-based mocking first
        response = try_mock_response(url, method.upper())
        if response:
            return response

        # Block unconfigured external HTTP calls
        if url.startswith(("http://", "https://")) and not is_local_url(url):
            # Check if this is an unmocked call to a configured API
            for service_name, _, setting in API_MOCKS:
                api_base = base_url(setting)
                if api_base and url.startswith(api_base):
                    raise UnmockedExternalCall(f"[E2E] Unmocked {service_name} call: {method.upper()} {url}")

            # Generic block for other external URLs
            raise UnmockedExternalCall(f"[E2E] Outbound HTTP blocked: {method.upper()} {url}")

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
