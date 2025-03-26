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

const setupRequestMock = (url: string) => {
  const nextUrl = new NextURL(url);
  when(mockedRequest.nextUrl).thenReturn(nextUrl);
  when(mockedRequest.url).thenReturn(domain);
};

const mockFetchResponse = (status: string) => {
  fetch.mockResponseOnce(
    JSON.stringify({
      status,
    }),
  );
};

describe("withRuleHasRegisteredOperation middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects industry user to onboarding if not registered", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    setupRequestMock(`${domain}/reporting/reports`);
    mockFetchResponse("Not Registered");

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

  it("allows industry user to continue if registered and valid report version", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    setupRequestMock(`${domain}/reporting/reports`);
    mockFetchResponse("Registered and Valid Report Version");

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasRegisteredOperation(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("redirects industry user to reports grid if registered and invalid report version", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    setupRequestMock(`${domain}/reporting/999`);
    mockFetchResponse("Registered and Invalid Report Version");

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

  it("allows industry user to continue if registered without report version", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    setupRequestMock(`${domain}/reporting/reports`);
    mockFetchResponse("Registered");

    const nextMiddleware = vi.fn(() => NextResponse.next());
    const middleware = withRuleHasRegisteredOperation(nextMiddleware);
    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(nextMiddleware).toHaveBeenCalledOnce();
    expect(result?.status).toBe(200);
  });

  it("redirects to onboarding if an error occurs in the user validation", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    setupRequestMock(`${domain}/reporting/reports`);
    fetch.mockRejectedValueOnce(new Error("API Error"));

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

  it("allows CAS user to continue without validation", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    setupRequestMock(`${domain}/reporting/reports`);

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
