import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockBaseToken } from "@bciers/testConfig/data/tokens";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withAuthorizationAdmin proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    const result = await proxy(
      mockRequest("/administration/operations"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user is authenticated and the path is in the authenticated allow list", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await proxy(
      mockRequest("/administration/profile"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });
});
