import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
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
const mockedRequest: NextRequest = mock(NextRequest);
const dashboardUrl = new URL("/dashboard", domain);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));
const mockGetToken = nextGetToken as ReturnType<typeof vi.fn>;

function mockRequest(path: string): NextRequest {
  const nextUrl = new NextURL(path, { base: domain });
  when(mockedRequest.nextUrl).thenReturn(nextUrl);
  when(mockedRequest.url).thenReturn(domain);
  return instance(mockedRequest);
}

describe("withAuthorizationDashboard middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(undefined);
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the operations page
    const result = await middleware(
      mockRequest("/registration/operations"),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware if the user is not authenticated and the route is /onboarding", async () => {
    const result = await middleware(
      mockRequest("/onboarding"),
      mockNextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("redirects to the administration profile page if the user has no app role", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await middleware(
      mockRequest("/dashboard"),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration/profile", domain),
    );
    expect(result).toBeInstanceOf(NextResponse);

    // 307 is the status code for a temporary redirect
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware if the user has no app role and the route ends in /profile", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await middleware(
      mockRequest("/profile"),
      mockNextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const result = await middleware(
      mockRequest("/onboarding"),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const result = await middleware(mockRequest(""), mockNextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated, authorized cas_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await middleware(mockRequest(""), mockNextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware for authenticated, authorized cas_user if the route is /dashboard", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(`${domain}/dashboard`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects authenticated, authorized cas_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await middleware(
      mockRequest("/onboarding"),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated, NON-authorized cas_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    const result = await middleware(mockRequest(""), mockNextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware for authenticated, NON-authorized cas_user if the route is in the allowed list", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);

    // Loop through the array of allowed paths
    for (const allowedPath of authAllowedPaths) {
      const result = await middleware(
        mockRequest(allowedPath),
        mockNextFetchEvent,
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
      const result = await middleware(mockRequest(path), mockNextFetchEvent);

      expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
      expect(result?.status).toBe(307);
    }

    expect(NextResponse.redirect).toHaveBeenCalledTimes(paths.length);
  });
});
