import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";
import { withResponseCompliance } from "../middlewares/withResponseCompliance";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

// 🧪 Create the middleware instance with a no-op base middleware
const middleware = withResponseCompliance(() => NextResponse.next());

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withResponseCompliance middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    reset(mockedRequest);
  });

  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/compliance/compliance-summaries`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({ status: "Registered" }));

    const result = await middleware(
      instance(mockedRequest),
      instance(mockNextFetchEvent),
    );

    const expectedUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/compliance-summaries`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(expectedUrl);
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    const nextUrl = new NextURL(`${domain}/compliance/compliance-summaries`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({ status: "Registered" }));

    const result = await middleware(
      instance(mockedRequest),
      instance(mockNextFetchEvent),
    );

    const expectedUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/compliance-summaries`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(expectedUrl);
    expect(result?.status).toBe(200);
  });
});
