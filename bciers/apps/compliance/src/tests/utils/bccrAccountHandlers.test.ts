import { actionHandler } from "@bciers/testConfig/mocks";
import {
  getBccrAccountDetails,
  getBccrComplianceUnits,
} from "@/compliance/src/app/utils/bccrAccountHandlers";

const TEST_ACCOUNT_ID = "123456789012345";
const TEST_COMPLIANCE_REPORT_VERSION_ID = 1;

describe("getBccrAccountDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the account details from the API", async () => {
    const mockResponse = { bccr_trading_name: "Test Company" };
    actionHandler.mockResolvedValueOnce(mockResponse);

    const result = await getBccrAccountDetails(
      TEST_ACCOUNT_ID,
      TEST_COMPLIANCE_REPORT_VERSION_ID,
    );

    expect(actionHandler).toHaveBeenCalledWith(
      `compliance/bccr/accounts/${TEST_ACCOUNT_ID}/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}`,
      "GET",
    );
    expect(result).toEqual(mockResponse);
  });

  it("returns the error message instead of throwing when the API call fails", async () => {
    const errorMessage =
      "The provided holding account does not own the compliance sub-account for this operation.";
    actionHandler.mockRejectedValueOnce(new Error(errorMessage));

    const result = await getBccrAccountDetails(
      TEST_ACCOUNT_ID,
      TEST_COMPLIANCE_REPORT_VERSION_ID,
    );

    expect(result).toEqual({ error: errorMessage });
  });
});

describe("getBccrComplianceUnits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the compliance units data from the API", async () => {
    const mockResponse = { bccr_compliance_account_id: "COMP123" };
    actionHandler.mockResolvedValueOnce(mockResponse);

    const result = await getBccrComplianceUnits(
      TEST_ACCOUNT_ID,
      TEST_COMPLIANCE_REPORT_VERSION_ID,
    );

    expect(actionHandler).toHaveBeenCalledWith(
      `compliance/bccr/accounts/${TEST_ACCOUNT_ID}/compliance-report-versions/${TEST_COMPLIANCE_REPORT_VERSION_ID}/compliance-units`,
      "GET",
      "",
    );
    expect(result).toEqual(mockResponse);
  });

  it("returns the error message instead of throwing when the API call fails", async () => {
    const errorMessage =
      "The provided holding account does not own the compliance sub-account for this operation.";
    actionHandler.mockRejectedValueOnce(new Error(errorMessage));

    const result = await getBccrComplianceUnits(
      TEST_ACCOUNT_ID,
      TEST_COMPLIANCE_REPORT_VERSION_ID,
    );

    expect(result).toEqual({ error: errorMessage });
  });
});
