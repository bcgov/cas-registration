import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";
import { withResponseCompliance } from "@/compliance/src/proxies/withResponseCompliance";

const domain = "https://localhost:3000";

// 🧪 Create the proxy instance with a no-op base proxy
const proxy = withResponseCompliance(() => NextResponse.next());

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}

describe("withResponseCompliance proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(JSON.stringify({ status: "Registered" }));

    const result = await proxy(
      mockRequest("/compliance/compliance-summaries"),
      {} as NextFetchEvent,
    );

    const expectedUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/compliance-summaries`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(expectedUrl);
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    fetch.mockResponseOnce(JSON.stringify({ status: "Registered" }));

    const result = await proxy(
      mockRequest("/compliance/compliance-summaries"),
      {} as NextFetchEvent,
    );

    const expectedUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/compliance-summaries`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(expectedUrl);
    expect(result?.status).toBe(200);
  });
});
