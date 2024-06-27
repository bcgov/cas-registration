import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { getToken } from "@bciers/testConfig/mocks";

const mockBaseToken = {
  name: "Test User",
  email: "ggircs@test.ca",
  sub: "uuid",
  given_name: "Test",
  family_name: "User",
  bceid_business_name: "Cas, Bcgov",
  bceid_business_guid: "guid",
  user_guid: "guid",
  full_name: "Test User",
  iat: 1719517475,
  exp: 1719519275,
  jti: "uuid",
};

const mockIndustryUserToken = {
  ...mockBaseToken,
  app_role: "industry_user",
  identity_provider: "bceidbusiness",
};

const mockCasPendingToken = {
  ...mockBaseToken,
  app_role: "cas_pending",
  identity_provider: "idir",
};

const mockCasUserToken = {
  ...mockBaseToken,
  app_role: "cas_user",
  identity_provider: "idir",
};

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
const dashboardUrl = new URL("/dashboard", domain);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withAuthorizationDashboard middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  test("redirects to the registration profile page if the user has no app role", async () => {
    getToken.mockResolvedValue(mockBaseToken);
    const nextUrl = new NextURL(`${domain}/dashboard`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/registration/profile", domain),
    );
    expect(result).toBeInstanceOf(NextResponse);

    // 307 is the status code for a temporary redirect
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware if the user has no app role and the route ends in /profile", async () => {
    getToken.mockResolvedValue(mockBaseToken);
    const nextUrl = new NextURL(`${domain}/profile`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects to the registration page if the user has cas_pending app role", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    const nextUrl = new NextURL(`${domain}/dashboard`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    nextUrl.pathname = "/registration";
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(nextUrl);

    expect(result?.status).toBe(200);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL("/onboarding", domain);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("redirects authenticated industry_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(domain);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("Redirects authenticated cas_user to the common dashboard if the route is /onboarding", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL("/onboarding", domain);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });

  it("Redirects authenticated cas_user to the common dashboard if the route is /", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(domain);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(dashboardUrl);
    expect(result?.status).toBe(307);
  });
});
