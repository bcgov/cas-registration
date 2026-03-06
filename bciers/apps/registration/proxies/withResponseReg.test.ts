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

describe("withResponse proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mocking the fetch response for access to an operator
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      }),
    );

    // Mock the fetch response for operator has required fields
    fetch.mockResponseOnce(
      JSON.stringify({
        has_required_fields: true,
      }),
    );

    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
      {} as NextFetchEvent,
    );

    const responseUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/register-an-operation`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest("/registration/operation"),
      {} as NextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/operation`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
