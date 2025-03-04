import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import middleware from "../middleware";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";
import { reportPaths } from "./withRulesAppliedReport";

const domain = "https://localhost:3000";
const versionId = "123";
const mockedRequest: NextRequest = mock(NextRequest);

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

vi.mock("@reporting/src/app/utils/getReportingOperation", () => ({
  getReportingOperation: vi.fn(),
}));

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

  it("redirects registered operation from verification if report does not needs verification", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(
      `${domain}/reporting/reports/${versionId}/verification`,
    );

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock the fetch response for operator has registered operation, true
    fetch.mockResponseOnce(
      JSON.stringify({
        has_registered_operation: true,
      }),
    );
    // Mock API response for report verification check
    fetch.mockResponseOnce(JSON.stringify(false));

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(`/reporting/reports/${versionId}/final-review`, domain),
    );
    expect(result?.status).toBe(307);
  });

  it("proceeds registered operation to verification if report needs verification", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(
      `${domain}/reporting/reports/${versionId}/verification`,
    );

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mock the fetch response for operator has registered operation, true
    fetch.mockResponseOnce(
      JSON.stringify({
        has_registered_operation: true,
      }),
    );
    // Mock API response for report verification check
    fetch.mockResponseOnce(JSON.stringify(true));

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it.each(reportPaths)(
    "redirects registered operation SFO from LFO path '%s' to /review-operation-information path",
    async (lfoPath) => {
      getToken.mockResolvedValue(mockIndustryUserToken);
      const nextUrl = new NextURL(
        `${domain}/reporting/reports/${versionId}/${lfoPath}`,
      );

      when(mockedRequest.nextUrl).thenReturn(nextUrl);
      when(mockedRequest.url).thenReturn(domain);

      // Mock the fetch response for operator having registered operation, true
      fetch.mockResponseOnce(
        JSON.stringify({
          has_registered_operation: true,
        }),
      );

      // Mock API response for getReportingOperation
      fetch.mockResponseOnce(
        JSON.stringify({
          report_operation: {
            operation_type: "Single Facility Operation",
          },
        }),
      );

      const result = await middleware(
        instance(mockedRequest),
        mockNextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(
          `/reporting/reports/${versionId}/review-operation-information`,
          domain,
        ),
      );
      expect(result?.status).toBe(307);
    },
  );
});
