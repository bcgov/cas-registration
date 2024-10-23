import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withRulesAppliedReport middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects industry users if their userOperator does not have registered operation", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/reporting`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock the fetch response for operator has registered operation, false
    fetch.mockResponseOnce(
      JSON.stringify({
        has_registered_operation: false,
      }),
    );

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

  it("proceeds industry users if their operator has registered operation", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/reporting/reports`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock the fetch response for operator has registered operation, true
    fetch.mockResponseOnce(
      JSON.stringify({
        has_registered_operation: true,
      }),
    );
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });
});
