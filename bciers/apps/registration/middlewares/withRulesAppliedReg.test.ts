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

describe("withRulesAppliedReg middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/registration`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({}));

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
  it("redirects industry users if their userOperator does not have required fields", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/registration`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mocking the fetch response for access to an operator
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      }),
    );
    fetch.mockResponseOnce(
      JSON.stringify({
        has_required_fields: false,
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
  it("proceeds industry users if their operator is found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/registration/register-an-operation`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    // Mocking the fetch response for access to an operator
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      }),
    );

    // Mock the fetch response for operator has required fields
    fetch.mockResponseOnce(
      JSON.stringify({
        has_required_fields: true,
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });
});
