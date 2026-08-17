import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextResponse } from "next/server";
import { domain, mockRequest } from "@bciers/testConfig/helpers/mockRequest";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";
import getCurrentUserOperatorWithRequiredFields from "@/registration/app/utils/getCurrentUserOperatorWithRequiredFields";

vi.mock("@/administration/app/components/userOperators/getCurrentUserOperator");
vi.mock("@/registration/app/utils/getCurrentUserOperatorWithRequiredFields");

vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");

describe("withResponse proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the correct URL for industry users", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);

    // Mock access to an operator exists
    vi.mocked(getCurrentUserOperator).mockResolvedValueOnce({
      operator_id: mockIndustryUserToken.user_guid,
      status: "Approved",
    } as any);

    // Mock required fields check returning true
    vi.mocked(getCurrentUserOperatorWithRequiredFields).mockResolvedValueOnce({
      has_required_fields: true,
    } as any);

    const result = await proxy(
      mockRequest("/registration/register-an-operation"),
      {} as NextFetchEvent,
    );

    const responseUrl = new NextURL(
      `${domain}/${mockIndustryUserToken.identity_provider}/${mockIndustryUserToken.app_role}/register-an-operation`,
    );

    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });

  it("builds the correct URL for CAS users", async () => {
    getToken.mockResolvedValue(mockCasUserToken);

    const result = await proxy(
      mockRequest("/registration/operation"),
      {} as NextFetchEvent,
    );
    const responseUrl = new NextURL(
      `${domain}/${mockCasUserToken.identity_provider}/${mockCasUserToken.app_role}/operation`,
    );
    expect(NextResponse.rewrite).toHaveBeenCalledOnce();
    expect(NextResponse.rewrite).toHaveBeenCalledWith(responseUrl);
    expect(result?.status).toBe(200);
  });
});
