import { NextFetchEvent, NextResponse } from "next/server";
import { DashboardRoutes } from "@bciers/proxies";
import { getToken } from "@bciers/actions";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";
import { withAuthorization } from "@bciers/proxies";
import { isUserArchived } from "@bciers/actions/api";

// Mock external dependencies
vi.mock("@bciers/actions", async () => {
  const actual = await vi.importActual("@bciers/actions");
  return {
    ...actual,
    getToken: vi.fn(),
  };
});

vi.mock("@bciers/actions/api", async () => {
  const actual = await vi.importActual("@bciers/actions/api");
  return {
    ...actual,
    isUserArchived: vi.fn(),
  };
});

vi.spyOn(NextResponse, "redirect");

describe("withAuthorization proxy", () => {
  const mockNext = vi.fn(() => NextResponse.next());
  const mw = withAuthorization(mockNext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated requests to onboarding", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(null);

    const req = mockRequest("/some-route");
    const result = await mw(req, {} as NextFetchEvent);

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(DashboardRoutes.ONBOARDING, domain),
    );
    expect(result?.status).toBe(307);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("redirects archived users to declined page", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockIndustryUserToken);
    vi.mocked(isUserArchived).mockResolvedValueOnce(true);

    const req = mockRequest("/some-route");
    const result = await mw(req, {} as NextFetchEvent);

    expect(isUserArchived).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(DashboardRoutes.DECLINED, domain),
    );
    expect(result?.status).toBe(307);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("proceeds to next proxy for authenticated, active users", async () => {
    vi.mocked(getToken).mockResolvedValueOnce(mockIndustryUserToken);
    vi.mocked(isUserArchived).mockResolvedValueOnce(false);

    const req = mockRequest("/some-route");
    const evt = {} as NextFetchEvent;

    await mw(req, evt);

    expect(isUserArchived).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockNext).toHaveBeenCalledWith(req, evt);
  });
});
