import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import proxy from "../proxy";
import { actionHandler, getToken } from "@bciers/testConfig/mocks";
import { mockCasPendingToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

function mockRequest(path: string): NextRequest {
  return {
    nextUrl: new NextURL(`${domain}${path}`),
    url: domain,
  } as unknown as NextRequest;
}

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
