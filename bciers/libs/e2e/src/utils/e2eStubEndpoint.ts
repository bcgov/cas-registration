import type { APIRequestContext, Page, Route } from "@playwright/test";
import { getUserGuidFromPage } from "@bciers/e2e/utils/authToken";
import { COMPLIANCE_E2E_INTEGRATION_STUB_PATH } from "@bciers/e2e/utils/constants";

/**
 * Args used to construct the payload sent to the Django E2E integration stub endpoint.
 *
 * Notes:
 * - `body` is the parsed request body from the intercepted request from RSC action payload.
 * - `userGuid` is resolved from the current Playwright page/session and is forwarded to Django
 */
type BuildStubDataArgs = {
  url: string;
  method: string;
  body: any;
  userGuid: string;
};

/**
 * Args passed to the fulfill handler after the Django stub endpoint responds successfully.
 *
 * Notes:
 * - `stubResponse` is the raw Playwright APIResponse returned by the Django stub call.
 * - `json` is the parsed JSON body of `stubResponse`.
 * - `route` is the intercepted route that must be fulfilled/continued by the caller.
 */
type FulfillArgs = {
  route: Route;
  stubResponse: any; // APIResponse
  json: any;
  url: string;
  method: string;
};

type Options = {
  method?: string; // default "POST"
  parseRscBody?: (raw: string) => any; // optional override

  // If true, bypass route interception entirely and call the Django stub directly once.
  directCall?: boolean; // default false
};

/**
 * Attach a Playwright route handler that:
 * 1) Intercepts requests matching `routePattern` (and `options.method`),
 * 2) Extracts the request body (default: RSC action payload extraction),
 * 3) Calls the Django E2E integration stub endpoint to mutate server-side DB state,
 * 4) Delegates fulfillment of the original intercepted request to `fulfill(...)`.
 *
 * Why this exists:
 * - In E2E, we often need to force the backend into a specific state (e.g., create earned credits,
 *   request issuance, mark director approval) without triggering real external integrations.
 * - This helper centralizes the "intercept → call stub endpoint → fulfill route" pattern.
 *
 * Error handling:
 * - If the stub endpoint returns a non-2xx response, this throws with `errorPrefix`
 *
 * Usage pattern:
 * - `buildStubData(...)` should construct the ScenarioPayload your Django stub expects.
 */
export async function attachE2EStubEndpoint(
  page: Page,
  api: APIRequestContext,
  routePattern: string | RegExp,
  buildStubData: (args: BuildStubDataArgs) => any,
  fulfill: (args: FulfillArgs) => Promise<void>,
  errorPrefix: string,
  options: Options = {},
): Promise<void> {
  const expectedMethod = (options.method ?? "POST").toUpperCase();

  const parseRscBody =
    options.parseRscBody ??
    ((raw: string) => {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.[3]?.body ? JSON.parse(parsed[3].body) : {};
    });

  // "direct call" mode: no routing, just call the stub endpoint once using the same auth header.
  if (options.directCall) {
    const userGuid = await getUserGuidFromPage(page);

    const stubResponse = await api.post(
      `${process.env.API_URL}${COMPLIANCE_E2E_INTEGRATION_STUB_PATH}`,
      {
        headers: {
          Authorization: JSON.stringify({ user_guid: userGuid }),
        },
        data: buildStubData({
          url: "direct-call",
          method: expectedMethod,
          body: {},
          userGuid,
        }),
      },
    );

    if (!stubResponse.ok()) {
      const text = await stubResponse.text();
      throw new Error(
        `${errorPrefix} stub endpoint failed: ${stubResponse.status()} – ${text}`,
      );
    }
    await stubResponse.json();
    return;
  }

  await page.route(routePattern, async (route: Route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    // Only intercept the method we expect; otherwise allow the request to proceed untouched.
    if (method !== expectedMethod) {
      return route.continue();
    }

    const userGuid = await getUserGuidFromPage(page);

    const raw = req.postData() ?? "";
    const body = parseRscBody(raw);

    const stubResponse = await api.post(
      `${process.env.API_URL}${COMPLIANCE_E2E_INTEGRATION_STUB_PATH}`,
      {
        headers: {
          Authorization: JSON.stringify({ user_guid: userGuid }),
        },
        data: buildStubData({ url, method, body, userGuid }),
      },
    );

    if (!stubResponse.ok()) {
      const text = await stubResponse.text();
      throw new Error(
        `${errorPrefix} stub endpoint failed: ${stubResponse.status()} – ${text}`,
      );
    }

    const json = await stubResponse.json();
    await fulfill({ route, stubResponse, json, url, method });
  });
}
