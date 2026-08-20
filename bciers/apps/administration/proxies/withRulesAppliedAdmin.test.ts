import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";
import { DashboardRoutes } from "@bciers/proxies";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";
import { UserOperator } from "@/administration/app/components/userOperators/types";

vi.mock("@/administration/app/components/userOperators/getCurrentUserOperator");

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withRulesAppliedAdmin proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects /operations for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce(
      undefined as unknown as UserOperator,
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
  it("redirects /operations for industry users if their operator is not pending or approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      status: "Declined",
    } as any);

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
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      status: "Approved",
    } as any);

    const result = await proxy(
      mockRequest("/administration/operations"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  it("redirects /select-operator for industry users if their userOperator status is approved", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      status: "Approved",
      operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      operatorLegalName: "My Operator",
    } as any);

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
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      status: "Pending",
      operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      operatorLegalName: "My Operator",
    } as any);

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

  it("proceeds /select-operator when userOperator resolves to undefined", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce(
      undefined as unknown as UserOperator,
    );

    const result = await proxy(
      mockRequest("/administration/select-operator"),
      {} as NextFetchEvent,
    );

    expect(result?.status).toBe(200);
  });

  it("proceeds /select-operator when getCurrentUserOperator throws a 404 Not Found error", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Triggers the catch block and tests isNotFoundError logic
    const notFoundError = Object.assign(new Error("HTTP error! Status: 404"), {
      status: 404,
    });
    vi.mocked(getCurrentUserOperator).mockRejectedValueOnce(notFoundError);

    const result = await proxy(
      mockRequest("/administration/select-operator"),
      {} as NextFetchEvent,
    );

    expect(NextResponse.redirect).not.toHaveBeenCalledWith(
      new URL(DashboardRoutes.ERROR, domain),
    );
    expect(result?.status).toBe(200);
  });

  it("redirects /contacts for industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce(
      undefined as unknown as UserOperator,
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
  it("redirects /contacts for industry users if their userOperator status is pending", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      status: "Pending",
      operatorId: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      operatorLegalName: "My Operator",
    } as any);

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
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: "feb4d26d-45e1-437a-b53f-b25e617c388f",
      status: "Approved",
    } as any);

    const result = await proxy(
      mockRequest("/administration/contacts"),
      {} as NextFetchEvent,
    );
    expect(result?.status).toBe(200);
  });

  describe("API failure / exception handling", () => {
    it("redirects to the error page when getCurrentUserOperator throws an error", async () => {
      getToken.mockResolvedValue(mockIndustryUserToken);
      vi.mocked(getCurrentUserOperator).mockRejectedValueOnce(
        new Error("Database connection error"),
      );

      const result = await proxy(
        mockRequest("/administration/operations"),
        {} as NextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(DashboardRoutes.ERROR, domain),
      );
      expect(result?.status).toBe(307);
    });
  });
});
