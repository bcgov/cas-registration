import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import proxy from "../proxy";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}

describe("withResponseReport proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mock the fetch response for operator has registered operation
    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Registered",
      }),
    );

    const result = await proxy(
      mockRequest("/reporting/reports"),
      {} as NextFetchEvent,
    );

    const responseUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/reports`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest("/reporting/reports"),
      {} as NextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/reports`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
