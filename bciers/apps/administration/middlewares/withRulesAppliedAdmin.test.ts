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

describe("withRulesAppliedAdmin middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects /operations for industry users if their userOperator is not found", async () => {
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
  it("redirects /operations for industry users if their operator is not pending or approved", async () => {
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
  it("proceeds /operations for industry users if their operator is approved", async () => {
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

  it("redirects /select-operator for industry users if their userOperator status is approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/select-operator`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Approved",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(`my-operator`, domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects /select-operator for industry users if their userOperator status is pending", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/select-operator`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Pending",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
      }),
    );

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(
        `select-operator/received/request-access/feb4d26d-45e1-437a-b53f-b25e617c388f?title=My%20Operator`,
        domain,
      ),
    );
    expect(result?.status).toBe(307);
  });
  it("proceeds /select-operator for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/select-operator`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await middleware(
      instance(mockedRequest),
      mockNextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects /contacts for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/contacts`);

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
  it("redirects /contacts for industry users if their userOperator status is pending", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    const nextUrl = new NextURL(`${domain}/administration/contacts`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Pending",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
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
  it("proceeds /contacts for industry users if their operator is approved", async () => {
    getToken.mockResolvedValue({
      ...mockIndustryUserToken,
      user_guid: "feb4d26d-45e1-437a-b53f-b25e617c388f",
    });
    const nextUrl = new NextURL(`${domain}/administration/contacts`);

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
});
