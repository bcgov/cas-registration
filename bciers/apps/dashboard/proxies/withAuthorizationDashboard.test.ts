import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import proxy from "../proxy";
import { authAllowedPaths } from "./withAuthorizationDashboard";

import { getToken } from "@bciers/testConfig/mocks";
import { getToken as nextGetToken } from "next-auth/jwt";
import {
  mockBaseToken,
  mockCasPendingToken,
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const dashboardUrl = new URL("/dashboard", domain);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));
const mockGetToken = nextGetToken as ReturnType<typeof vi.fn>;

function mockRequest(path: string): NextRequest {
  const nextUrl = new NextURL(path, { base: domain });
  return { nextUrl, url: domain } as unknown as NextRequest;
}

describe("withAuthorizationDashboard proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(undefined);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the operations page
    const result = await proxy(
      mockRequest("/registration/operations"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user is not authenticated and the route is /onboarding", async () => {
    const result = await proxy(
      mockRequest("/onboarding"),
      {} as NextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("redirects to the administration profile page if the user has no app role", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await proxy(mockRequest("/dashboard"), {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration/profile", domain),
    );
    expect(result).toBeInstanceOf(NextResponse);

    // 307 is the status code for a temporary redirect
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user has no app role and the route ends in /profile", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await proxy(mockRequest("/profile"), {} as NextFetchEvent);

    expect(result?.status).toBe(200);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const result = await proxy(
      mockRequest("/onboarding"),
      {} as NextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const result = await proxy(mockRequest(""), {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated, authorized cas_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(mockRequest(""), {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy for authenticated, authorized cas_user if the route is /dashboard", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(mockRequest("/dashboard"), {} as NextFetchEvent);
    expect(result?.status).toBe(200);
  });

  it("redirects authenticated, authorized cas_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest("/onboarding"),
      {} as NextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated, NON-authorized cas_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    const result = await proxy(mockRequest(""), {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy for authenticated, NON-authorized cas_user if the route is in the allowed list", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);

    // Loop through the array of allowed paths
    for (const allowedPath of authAllowedPaths) {
      const result = await proxy(
        mockRequest(allowedPath),
        {} as NextFetchEvent,
      );

      expect(result?.status).toBe(200);
    }
  });

  it("redirects authenticated, NON-authorized cas_user to the common dashboard if the route is /administration, /compliance, /onboarding, /registration, /reporting", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    const paths = [
      "/administration",
      "/compliance",
      "/onboarding",
      "/registration",
      "/reporting",
    ];

    for (const path of paths) {
      const result = await proxy(mockRequest(path), {} as NextFetchEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
      expect(result?.status).toBe(307);
    }

    expect(NextResponse.redirect).toHaveBeenCalledTimes(paths.length);
  });
});
