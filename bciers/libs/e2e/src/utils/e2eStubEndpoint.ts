import type { APIRequestContext, Page, Route } from "@playwright/test";
import { getUserGuidFromPage } from "@bciers/e2e/utils/authToken";
import {
  COMPLIANCE_E2E_INTEGRATION_STUB_PATH,
  DJANGO_API_BASE_URL,
} from "@bciers/e2e/utils/constants";

type BuildStubDataArgs = {
  url: string;
  method: string;
  body: any;
  userGuid: string;
};

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
};

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

  await page.route(routePattern, async (route: Route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (method !== expectedMethod) {
      return route.continue();
    }

    const userGuid = await getUserGuidFromPage(page);

    const raw = req.postData() ?? "";
    const body = parseRscBody(raw);

    const stubResponse = await api.post(
      `${DJANGO_API_BASE_URL}${COMPLIANCE_E2E_INTEGRATION_STUB_PATH}`,
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
