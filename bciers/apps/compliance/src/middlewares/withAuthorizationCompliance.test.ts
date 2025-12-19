import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockCasUserToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withAuthorizationCompliance middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    const nextUrl = new NextURL(`${domain}/compliance`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await proxy(instance(mockedRequest), mockNextFetchEvent);
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("builds the correct URL for authenticated users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(
      `${domain}/compliance/compliance-administration/compliance-summaries`,
    );

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await proxy(instance(mockedRequest), mockNextFetchEvent);
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/compliance-administration/compliance-summaries`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
