import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withResponseReport middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });
  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/reporting/reports`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock the fetch response for operator has registered operation
    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Registered",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    const responseUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/reports`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(`${domain}/reporting/reports`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/reports`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
