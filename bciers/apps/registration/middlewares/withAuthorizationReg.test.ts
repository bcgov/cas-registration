import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { actionHandler, getToken } from "@bciers/testConfig/mocks";
import { mockCasPendingToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withAuthorizationReg middleware", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });
  it("redirects to the declined page if the user is archived", async () => {
    getToken.mockResolvedValue(mockCasPendingToken);
    actionHandler.mockResolvedValue(true); // this mocks hitting registration/user/user-is-archived

    // The user tries to access the register an register an operation page
    const nextUrl = new NextURL(`${domain}/registration/register-an-operation`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/dashboard/declined", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the register an register an operation page
    const nextUrl = new NextURL(`${domain}/registration/register-an-operation`);

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
});
