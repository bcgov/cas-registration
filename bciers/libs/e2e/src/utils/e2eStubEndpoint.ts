import type { APIRequestContext, Page } from "@playwright/test";
import { getUserGuidFromPage } from "@bciers/e2e/utils/authToken";
import { COMPLIANCE_E2E_INTEGRATION_STUB_PATH } from "@bciers/e2e/utils/constants";

/**
 * Args used to construct the payload sent to the Django E2E integration stub endpoint.
 *
 * Notes:
 * - `userGuid` is resolved from the current Playwright page/session and is forwarded to Django
 */
type BuildStubDataArgs = {
  method: string;
  userGuid: string;
};

type Options = {
  method?: string; // default "POST"
  parseRscBody?: (raw: string) => any; // optional override

  // If true, bypass route interception entirely and call the Django stub directly once.
  directCall?: boolean; // default false
};

/**
 * Attach a Playwright route handler that calls the Django E2E integration stub endpoint to mutate server-side DB state,
 *
 * Why this exists:
 * - In E2E, we often need to force the backend into a specific state (e.g., create earned credits,
 *   request issuance, mark director approval) without triggering real external integrations.
 * - This helper centralizes the "intercept → call stub endpoint → fulfill route" pattern.
 */
export async function attachE2EStubEndpoint(
  page: Page,
  api: APIRequestContext,
  buildStubData: (args: BuildStubDataArgs) => any,
  errorPrefix: string,
  options: Options = {},
): Promise<void> {
  const expectedMethod = (options.method ?? "POST").toUpperCase();

  // call the stub endpoint
  const userGuid = await getUserGuidFromPage(page);

  const stubResponse = await api.post(
    `${process.env.API_URL}${COMPLIANCE_E2E_INTEGRATION_STUB_PATH}`,
    {
      headers: {
        Authorization: JSON.stringify({ user_guid: userGuid }),
      },
      data: buildStubData({
        method: expectedMethod,
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
  return;
}
