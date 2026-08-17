import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockIndustryUserToken } from "@bciers/testConfig/data/tokens";
import { DashboardRoutes } from "@bciers/proxies";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";
import getCurrentUserOperatorWithRequiredFields from "@/registration/app/utils/getCurrentUserOperatorWithRequiredFields";

vi.mock("@/administration/app/components/userOperators/getCurrentUserOperator");
vi.mock("@/registration/app/utils/getCurrentUserOperatorWithRequiredFields");

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withRulesAppliedReg proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects industry users if their userOperator is not found", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce(undefined);

    const result = await proxy(
      mockRequest("/registration"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("redirects industry users if their userOperator does not have required fields", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mocking the response for access to an operator
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: mockIndustryUserToken.user_guid,
      status: "Approved",
    } as any);
    // Mock the response for operator has required fields, false
    vi.mocked(getCurrentUserOperatorWithRequiredFields).mockResolvedValueOnce({
      has_required_fields: false,
    } as any);

    const result = await proxy(
      mockRequest("/registration"),
      {} as NextFetchEvent,
    );
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("proceeds industry users if their operator is found and has required fields", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mocking the response for access to an operator
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: mockIndustryUserToken.user_guid,
      status: "Approved",
    } as any);

    // Mock the response for operator has required fields, true
    vi.mocked(getCurrentUserOperatorWithRequiredFields).mockResolvedValueOnce({
      has_required_fields: true,
    } as any);

    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
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
        mockRequest("/registration"),
        {} as NextFetchEvent,
      );

      expect(NextResponse.redirect).toHaveBeenCalledOnce();
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(DashboardRoutes.ERROR, domain),
      );
      expect(result?.status).toBe(307);
    });

    it("redirects to the error page when getCurrentUserOperatorWithRequiredFields throws an error", async () => {
      getToken.mockResolvedValue(mockIndustryUserToken);
      vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
        operator_id: mockIndustryUserToken.user_guid,
        status: "Approved",
      } as any);
      vi.mocked(getCurrentUserOperatorWithRequiredFields).mockRejectedValueOnce(
        new Error("API service unavailable"),
      );

      const result = await proxy(
        mockRequest("/registration"),
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
