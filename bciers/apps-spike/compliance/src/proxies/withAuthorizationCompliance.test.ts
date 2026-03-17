import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockCasUserToken } from "@bciers/testConfig/data/tokens";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withAuthorizationCompliance proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    const result = await proxy(
      mockRequest("/compliance"),
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
      mockRequest("/compliance/compliance-administration/compliance-summaries"),
      {} as NextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/compliance-administration/compliance-summaries`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
