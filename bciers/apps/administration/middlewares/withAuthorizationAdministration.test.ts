import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockBaseToken,
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withAuthorizationRegistration middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the operations page
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextMiddleware if the user is authenticated and the path is in the authenticated allow list", async () => {
    getToken.mockResolvedValue(mockBaseToken);
    const nextUrl = new NextURL(`${domain}/administration/profile`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects industry users to the administration page if their operator is not pending or approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Declined",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("redirects industry users to the administration page if they don't have an operator", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("does not redirect industry users to the administration page if their operator is approved", async () => {
    getToken.mockResolvedValue({
      ...mockIndustryUserToken,
      user_guid: "feb4d26d-45e1-437a-b53f-b25e617c388f",
    });
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Approved",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("does not redirect industry users to the administration page if their operator is pending", async () => {
    getToken.mockResolvedValue({
      ...mockIndustryUserToken,
      user_guid: "feb4d26d-45e1-437a-b53f-b25e617c388f",
    });
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Pending",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/operators`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/operators`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(`${domain}/administration/operators`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/operators`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});