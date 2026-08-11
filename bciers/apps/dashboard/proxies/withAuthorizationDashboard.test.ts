import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
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
import { isUserArchived } from "@bciers/actions/api";
import { DashboardRoutes } from "@bciers/proxies";

const dashboardUrl = new URL(DashboardRoutes.DASHBOARD, domain);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

vi.mock("@bciers/actions/api", async () => {
  const actual = await vi.importActual("@bciers/actions/api");
  return {
    ...actual,
    isUserArchived: vi.fn(),
  };
});

const mockGetToken = nextGetToken as ReturnType<typeof vi.fn>;

describe("withAuthorizationDashboard proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockReturnValue(undefined);
    // Default isUserArchived to false so existing authenticated tests succeed
    vi.mocked(isUserArchived).mockResolvedValue(false);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the operations page
    const result = await proxy(
      mockRequest("/registration/operations"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(DashboardRoutes.ONBOARDING, domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user is not authenticated and the route is /onboarding", async () => {
    const result = await proxy(
      mockRequest(DashboardRoutes.ONBOARDING),
      {} as NextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("redirects to the administration profile page if the user has no app role", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await proxy(
      mockRequest(DashboardRoutes.DASHBOARD),
      {} as NextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(DashboardRoutes.PROFILE, domain),
    );
    expect(result).toBeInstanceOf(NextResponse);

    // 307 is the status code for a temporary redirect
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user has no app role and the route ends in /profile", async () => {
    getToken.mockResolvedValue(mockBaseToken);

    const result = await proxy(
      mockRequest(DashboardRoutes.PROFILE),
      {} as NextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const result = await proxy(
      mockRequest(DashboardRoutes.ONBOARDING),
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

    const result = await proxy(
      mockRequest(DashboardRoutes.DASHBOARD),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects authenticated, authorized cas_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest(DashboardRoutes.ONBOARDING),
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

  describe("archived user handling", () => {
    it("redirects an archived user to the declined page when accessing a protected route", async () => {
      getToken.mockResolvedValue(mockIndustryUserToken);
      vi.mocked(isUserArchived).mockResolvedValueOnce(true);

      const result = await proxy(
        mockRequest(DashboardRoutes.DASHBOARD),
        {} as NextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(DashboardRoutes.DECLINED, domain),
      );
      expect(result?.status).toBe(307);
    });

    it("redirects an archived user to the declined page regardless of the requested route", async () => {
      getToken.mockResolvedValue(mockIndustryUserToken);
      vi.mocked(isUserArchived).mockResolvedValue(true);

      const routesToTest = [
        DashboardRoutes.PROFILE,
        "/registration/operations",
        "/reporting",
      ];

      for (const route of routesToTest) {
        vi.clearAllMocks();
        const result = await proxy(mockRequest(route), {} as NextFetchEvent);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
          new URL(DashboardRoutes.DECLINED, domain),
        );
        expect(result?.status).toBe(307);
      }
    });
  });

  describe("API failure / exception handling", () => {
    it("redirects to the error page when getToken throws an error", async () => {
      // Simulate an internal failure during session check
      getToken.mockRejectedValueOnce(new Error("JWT retrieval failed"));

      const result = await proxy(
        mockRequest(DashboardRoutes.DASHBOARD),
        {} as NextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(DashboardRoutes.ERROR, domain),
      );
      expect(result?.status).toBe(307);
    });

    it("redirects to the error page when isUserArchived API call throws an error", async () => {
      // User has a token, but the API endpoint fails
      getToken.mockResolvedValue(mockIndustryUserToken);
      vi.mocked(isUserArchived).mockRejectedValueOnce(
        new Error("Database connection error"),
      );

      const result = await proxy(
        mockRequest(DashboardRoutes.DASHBOARD),
        {} as NextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(DashboardRoutes.ERROR, domain),
      );
      expect(result?.status).toBe(307);
    });
  });
});
