from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from compliance.api.router import router
from .mocking import e2e_sandbox
from .scenarios import SCENARIO_HANDLERS
from .schemas import ScenarioPayload


@router.post(
    "/e2e-integration-stub",
    description=(
        "Run a test integration scenario to mutate DB state for E2E tests, while blocking/mocking "
        "outbound HTTP to external systems (eLicensing/BCCR). Only available in local/CI environments."
    ),
)
def run_e2e_integration_stub(request: HttpRequest, data: ScenarioPayload) -> HttpResponse:
    if settings.CI != "true" and settings.ENVIRONMENT != "local":
        return HttpResponse(
            "This endpoint only exists in the local/CI environments.",
            status=404,
        )

    # Look up the scenario handler from the registry
    handler = SCENARIO_HANDLERS.get(data.scenario)
    if handler is None:
        return HttpResponse(
            f"Unknown scenario: {data.scenario}",
            status=400,
        )

    # Execute scenario in sandbox: mocks external APIs, bypasses RLS, wraps in transaction
    with e2e_sandbox():
        result = handler.execute(request, data)

    return JsonResponse(result, status=200)


__all__ = [
    "run_e2e_integration_stub",
    "ScenarioPayload",
    "SCENARIO_HANDLERS",
    "e2e_sandbox",
]
