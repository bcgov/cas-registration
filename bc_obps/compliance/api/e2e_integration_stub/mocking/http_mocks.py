import re
from contextlib import contextmanager
from decimal import Decimal
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


# Invoice balance constants used across initial obligation scenarios
_INITIAL_OUTSTANDING = "1000968.64"


class _InvoiceMock:
    """
    Stateful mock for the eLicensing invoice GET and adjust POST endpoints.
    """

    def __init__(self) -> None:
        self._adjusted = False
        self._posted_adjustment_amount: Optional[str] = None
        self._posted_adjustment_reason: Optional[str] = None

    def get(self, url: str, **_kwargs: Any) -> Response:
        outstanding_dec = Decimal(_INITIAL_OUTSTANDING)
        if self._adjusted and self._posted_adjustment_amount is not None:
            outstanding_dec += Decimal(self._posted_adjustment_amount)
        outstanding_dec = max(outstanding_dec, Decimal("0.00"))
        outstanding = str(outstanding_dec.quantize(Decimal("0.01")))
        adjustment_amount = self._posted_adjustment_amount
        adjustment_reason = self._posted_adjustment_reason
        adjustments = (
            [
                {
                    "adjustmentObjectId": "1",
                    "adjustmentTotal": adjustment_amount,
                    "amount": adjustment_amount,
                    "date": "2025-12-18",
                    "reason": adjustment_reason,
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
                        "description": "GGIRCA Compliance Obligation",
                        "baseAmount": _INITIAL_OUTSTANDING,
                        "taxTotal": "0.00",
                        "adjustmentTotal": adjustment_amount if self._adjusted else "0.00",
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

    def adjust(self, url: str, **kwargs: Any) -> Response:
        self._adjusted = True
        payload: dict[str, Any] = kwargs.get("json") or {}
        targets = [payload, payload.get("feeAdjustment", {}), (payload.get("adjustments") or [{}])[0]]

        for target in targets:
            if not isinstance(target, dict):
                continue

            raw_amount = target.get("adjustmentTotal") or target.get("amount")
            raw_reason = target.get("reason")

            if raw_amount is not None:
                self._posted_adjustment_amount = str(Decimal(str(raw_amount)).quantize(Decimal("0.01")))
            if raw_reason is not None:
                self._posted_adjustment_reason = str(raw_reason)

            if raw_amount or raw_reason:
                break

        return json_response(200, {"clientObjectId": 123}, url)


# Static eLicensing mocks
_ELICENSING_STATIC_MOCKS: list[tuple[str, str, Callable[..., Response]]] = [
    (
        rf"{ELicensingAPIClient.CLIENT_ENDPOINT}$",
        "POST",
        lambda url, **_kwargs: json_response(
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
        lambda url, **_kwargs: json_response(
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
        lambda url, **_kwargs: json_response(
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


BCCR_MOCKS: list[tuple[str, str, Callable[..., Response]]] = [
    (
        rf"{BCCarbonRegistryAPIClient.AUTH_ENDPOINT}$",
        "POST",
        lambda url, **_kwargs: json_response(
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
        lambda url, **_kwargs: json_response(
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
        lambda url, **_kwargs: json_response(200, E2E_PROJECT_DETAILS, url),
    ),
    (
        rf"{BCCarbonRegistryAPIClient.ISSUANCE_SUBMIT_ENDPOINT}$",
        "POST",
        lambda url, **_kwargs: json_response(200, {"id": "E2E-ISSUANCE-1"}, url),
    ),
    (
        rf"{BCCarbonRegistryAPIClient.PROJECT_DETAILS_ENDPOINT}/\d+(?:/)?(?:\?.*)?$",
        "GET",
        lambda url, **_kwargs: json_response(
            200,
            E2E_PROJECT_DETAILS,
            url,
        ),
    ),
]


def match_endpoint(
    url: str, method: str, mocks: list[tuple[str, str, Callable[..., Response]]], **kwargs: Any
) -> Optional[Response]:
    """Match URL and method against registered mocks using regex patterns."""
    for pattern, expected_method, handler in mocks:
        if method == expected_method and re.search(pattern, url):
            return handler(url, **kwargs)
    return None


@contextmanager
def mock_external_http() -> Iterator[None]:
    """Block external HTTP and return mocked responses for eLicensing/BCCR."""
    # Fresh invoice mock state for each context invocation — no cross-request leakage
    invoice_mock = _InvoiceMock()

    elicensing_mocks: list[tuple[str, str, Callable[..., Response]]] = _ELICENSING_STATIC_MOCKS + [
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
        response = _pattern_based_mocking(url, method, api_mocks, **_kwargs)
        if response is not None:
            response.url = url
            return response

        _block_unconfigured_external_http_calls(url, method, api_mocks)
        return None

    def _pattern_based_mocking(
        url: str, method: str, api_mocks: list[tuple[str, list, str]], **_kwargs
    ) -> Optional[Response]:
        for _, patterns, _ in api_mocks:
            response = match_endpoint(url, method.upper(), patterns, **_kwargs)
            if response is not None:
                return response
        return None

    def _block_unconfigured_external_http_calls(url: str, method: str, api_mocks: list[tuple[str, list, str]]) -> None:
        if url.startswith(("http://", "https://")) and not is_local_url(url):  # NOSONAR
            # Check if this is an unmocked call to a configured API
            for service_name, _, setting in api_mocks:
                api_base = base_url(setting)
                if api_base and url.startswith(api_base):
                    raise UnmockedExternalCall(f"[E2E] Unmocked {service_name} call: {method.upper()} {url}")

            # Generic block for other external URLs
            raise UnmockedExternalCall(f"[E2E] Outbound HTTP blocked: {method.upper()} {url}")

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
