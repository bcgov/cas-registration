import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import proxy from "../proxy";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}

describe("withRulesAppliedReg proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await proxy(
      mockRequest("/registration"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects industry users if their userOperator does not have required fields", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mocking the fetch response for access to an operator
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      }),
    );
    // Mock the fetch response for operator has required fields, false
    fetch.mockResponseOnce(
      JSON.stringify({
        has_required_fields: false,
      }),
    );

    const result = await proxy(
      mockRequest("/registration"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("proceeds industry users if their operator is found and has required fields", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mocking the fetch response for access to an operator
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      }),
    );

    // Mock the fetch response for operator has required fields, true
    fetch.mockResponseOnce(
      JSON.stringify({
        has_required_fields: true,
      }),
    );

    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
      {} as NextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });
});
