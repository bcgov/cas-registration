import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { actionHandler, getToken } from "@bciers/testConfig/mocks";
import { mockCasPendingToken } from "@bciers/testConfig/data/tokens";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withAuthorizationReg proxy", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("redirects to the declined page if the user is archived", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    actionHandler.mockResolvedValue(true); // this mocks hitting registration/user/user-is-archived

    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/declined", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects to the onboarding page if the user is not authenticated", async () => {
    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });
});
