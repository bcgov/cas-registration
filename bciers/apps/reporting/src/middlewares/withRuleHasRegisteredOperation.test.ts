import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import { withRuleHasRegisteredOperation } from "./withRuleHasRegisteredOperation";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";
import * as constants from "./constants";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

vi.spyOn(NextResponse, "redirect");

describe("withRuleHasRegisteredOperation middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects industry user to onboarding if no registered operation", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const nextUrl = new NextURL(`${domain}/reporting/reports`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({ has_registered_operation: false }));

    const middleware = withRuleHasRegisteredOperation(() =>
      NextResponse.next(),
    );
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(result?.status).toBe(307);
  });

  it("allows industry user to continue if registered operation exists", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const nextUrl = new NextURL(`${domain}/reporting/reports`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({ has_registered_operation: true }));
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(null);

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasRegisteredOperation(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("allows industry user to continue when reportVersionId is valid", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const nextUrl = new NextURL(`${domain}/reporting/123`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // First fetch: has_registered_operation = true
    fetch.mockResponseOnce(JSON.stringify({ has_registered_operation: true }));

    // ReportVersionId extraction returns 123
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(123);

    // Second fetch: the valid report_version_id list
    fetch.mockResponseOnce(
      JSON.stringify({ items: [{ report_version_id: 123 }] }),
    );

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasRegisteredOperation(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("redirects industry user to reports grid if reportVersionId is invalid", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    const nextUrl = new NextURL(`${domain}/reporting/999`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // First fetch: has_registered_operation = true
    fetch.mockResponseOnce(JSON.stringify({ has_registered_operation: true }));

    // ReportVersionId extraction returns 999 (invalid)
    vi.spyOn(constants, "extractReportVersionId").mockReturnValue(999);

    // Second fetch: valid report_version_ids are 1, 2, 3 (no 999)
    fetch.mockResponseOnce(
      JSON.stringify({
        items: [
          { report_version_id: 1 },
          { report_version_id: 2 },
          { report_version_id: 3 },
        ],
      }),
    );

    const middleware = withRuleHasRegisteredOperation(() =>
      NextResponse.next(),
    );
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(constants.REPORT_APP_BASE, domain),
    );
    expect(result?.status).toBe(307);
  });

  it("allows CAS user to continue without validation", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const nextUrl = new NextURL(`${domain}/reporting/reports`);
    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasRegisteredOperation(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });
});
