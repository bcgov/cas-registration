import re
from contextlib import contextmanager
from typing import Any, Callable, Iterator, Optional
from unittest.mock import patch
import requests
from requests.models import Response
from ..utils import base_url, is_local_url, json_response
from compliance.service.bc_carbon_registry.bc_carbon_registry_api_client import BCCarbonRegistryAPIClient
from compliance.service.elicensing.elicensing_api_client import ELicensingAPIClient


class UnmockedExternalCall(RuntimeError):
    """Raised when code tries to call an external system not mocked in E2E sandbox."""

    pass


# Invoice balance constants used across initial obligation and supplementary adjustment scenarios
_INITIAL_OUTSTANDING = "10536.5120"
_POST_ADJUSTMENT_OUTSTANDING = "2921.9200"
_ADJUSTMENT_AMOUNT = "7614.5920"


class _InvoiceMock:
    """
    Stateful mock for the eLicensing invoice GET and adjust POST endpoints.
    """

    def __init__(self) -> None:
        self._adjusted = False

    def get(self, url: str) -> Response:
        outstanding = _POST_ADJUSTMENT_OUTSTANDING if self._adjusted else _INITIAL_OUTSTANDING
        adjustments = (
            [
                {
                    "adjustmentObjectId": "1",
                    "adjustmentTotal": _ADJUSTMENT_AMOUNT,
                    "amount": _ADJUSTMENT_AMOUNT,
                    "date": "2025-12-18",
                    "reason": "Supplementary Report Adjustment",
                    "type": "Adjustment",
                }
            ]
            if self._adjusted
            else []
        )
        return json_response(
            200,
            {
                "clientObjectId": "123",
                "clientGUID": "00000000-0000-0000-0000-000000000000",
                "invoiceNumber": "INV-999",
                "invoicePaymentDueDate": "2025-12-31",
                "invoiceOutstandingBalance": outstanding,
                "invoiceFeeBalance": outstanding,
                "invoiceInterestBalance": "0.00",
                "fees": [
                    {
                        "feeObjectId": 999,
                        "feeGUID": "11111111-1111-1111-1111-111111111111",
                        "businessAreaCode": "E2E",
                        "feeDate": "2025-12-18",
                        "description": "E2E Test Fee",
                        "baseAmount": _INITIAL_OUTSTANDING,
                        "taxTotal": "0.00",
                        "adjustmentTotal": _ADJUSTMENT_AMOUNT if self._adjusted else "0.00",
                        "taxAdjustmentTotal": "0.00",
                        "paymentBaseAmount": _INITIAL_OUTSTANDING,
                        "paymentTotal": _INITIAL_OUTSTANDING,
                        "invoiceNumber": "INV-999",
                        "payments": [],
                        "adjustments": adjustments,
                    }
                ],
            },
            url,
        )

    def adjust(self, url: str) -> Response:
        self._adjusted = True
        return json_response(200, {"clientObjectId": 123}, url)


# Static eLicensing mocks that do not depend on request ordering
_ELICENSING_STATIC_MOCKS: list[tuple[str, str, Callable[[str], Response]]] = [
    (
        rf"{ELicensingAPIClient.CLIENT_ENDPOINT}$",
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
        rf"{ELicensingAPIClient.CLIENT_ENDPOINT}/\d+{ELicensingAPIClient.FEES_ENDPOINT}$",
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
        rf"{ELicensingAPIClient.CLIENT_ENDPOINT}/\d+{ELicensingAPIClient.INVOICE_ENDPOINT}$",
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
        rf"{BCCarbonRegistryAPIClient.AUTH_ENDPOINT}$",
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
        rf"{BCCarbonRegistryAPIClient.ACCOUNT_SEARCH_ENDPOINT}$",
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
        rf"{BCCarbonRegistryAPIClient.PROJECT_SUBMIT_ENDPOINT}$",
        "POST",
        lambda url: json_response(200, E2E_PROJECT_DETAILS, url),
    ),
    (
        rf"{BCCarbonRegistryAPIClient.ISSUANCE_SUBMIT_ENDPOINT}$",
        "POST",
        lambda url: json_response(200, {"id": "E2E-ISSUANCE-1"}, url),
    ),
    (
        rf"{BCCarbonRegistryAPIClient.PROJECT_DETAILS_ENDPOINT}/\d+(?:/)?(?:\?.*)?$",
        "GET",
        lambda url: json_response(
            200,
            E2E_PROJECT_DETAILS,
            url,
        ),
    ),
]


def match_endpoint(
    url: str, method: str, mocks: list[tuple[str, str, Callable[[str], Response]]]
) -> Optional[Response]:
    """Match URL and method against registered mocks using regex patterns."""
    for pattern, expected_method, handler in mocks:
        if method == expected_method and re.search(pattern, url):
            return handler(url)
    return None


@contextmanager
def mock_external_http() -> Iterator[None]:
    """Block external HTTP and return mocked responses for eLicensing/BCCR."""
    # Fresh invoice mock state for each context invocation — no cross-request leakage
    invoice_mock = _InvoiceMock()

    elicensing_mocks: list[tuple[str, str, Callable[[str], Response]]] = _ELICENSING_STATIC_MOCKS + [
        (
            rf"{ELicensingAPIClient.CLIENT_ENDPOINT}/\d+{ELicensingAPIClient.INVOICE_ENDPOINT}$",
            "GET",
            invoice_mock.get,
        ),
        (
            rf"{ELicensingAPIClient.CLIENT_ENDPOINT}/\d+{ELicensingAPIClient.ADJUST_ENDPOINT}$",
            "POST",
            invoice_mock.adjust,
        ),
    ]

    api_mocks = [
        ("eLicensing", elicensing_mocks, "ELICENSING_API_URL"),
        ("BCCR", BCCR_MOCKS, "BCCR_API_URL"),
    ]

    real_session_request = requests.sessions.Session.request
    real_requests_request = requests.api.request

    def dispatch(method: str, url: str, **_kwargs: Any) -> Optional[Response]:
        # Try pattern-based mocking first
        for _, patterns, _ in api_mocks:
            response = match_endpoint(url, method.upper(), patterns)
            if response is not None:
                response.url = url
                return response

        # Block unconfigured external HTTP calls
        if url.startswith(("http://", "https://")) and not is_local_url(url):  # NOSONAR
            # Check if this is an unmocked call to a configured API
            for service_name, _, setting in api_mocks:
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
