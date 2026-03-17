import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { fetch, getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withRulesAppliedAdmin proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects /operations for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await proxy(
      mockRequest("/administration/operations"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects /operations for industry users if their operator is not pending or approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Declined",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/operations"),
      {} as NextFetchEvent,
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
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Approved",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/operations"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects /select-operator for industry users if their userOperator status is approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Approved",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/select-operator"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(`my-operator`, domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects /select-operator for industry users if their userOperator status is pending", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Pending",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/select-operator"),
      {} as NextFetchEvent,
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
    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await proxy(
      mockRequest("/administration/select-operator"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects /contacts for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(JSON.stringify({}));

    const result = await proxy(
      mockRequest("/administration/contacts"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/administration", domain),
    );
    expect(result?.status).toBe(307);
  });
  it("redirects /contacts for industry users if their userOperator status is pending", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    fetch.mockResponseOnce(
      JSON.stringify({
        status: "Pending",
        operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        operatorLegalName: "My Operator",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/contacts"),
      {} as NextFetchEvent,
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
    fetch.mockResponseOnce(
      JSON.stringify({
        operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
        status: "Approved",
      }),
    );

    const result = await proxy(
      mockRequest("/administration/contacts"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });
});
