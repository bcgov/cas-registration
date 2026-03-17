import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

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
