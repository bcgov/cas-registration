import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockCasUserToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}

describe("withAuthorizationReporting proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    const result = await proxy(
      mockRequest("/reporting/report"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("builds the correct URL for authenticated users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest("/reporting/report"),
      {} as NextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/report`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
