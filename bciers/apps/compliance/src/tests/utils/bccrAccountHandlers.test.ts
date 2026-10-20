import {
  getBccrAccountDetails,
  getBccrComplianceUnits,
} from "@/compliance/src/app/utils/bccrAccountHandlers";
import { actionHandler } from "@bciers/testConfig/mocks";

const ACCOUNT_ID = "123456789012345";
const COMPLIANCE_REPORT_VERSION_ID = 123;

describe("bccrAccountHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBccrAccountDetails", () => {
    it("returns the account details response", async () => {
      const response = { bccr_trading_name: "Test Company" };
      actionHandler.mockResolvedValueOnce(response);

      await expect(
        getBccrAccountDetails(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual(response);
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/bccr/accounts/${ACCOUNT_ID}/compliance-report-versions/${COMPLIANCE_REPORT_VERSION_ID}`,
        "GET",
      );
    });

    it("returns a thrown error as { error, status }", async () => {
      actionHandler.mockRejectedValueOnce(
        Object.assign(new Error("Internal Server Error."), { status: 500 }),
      );

      await expect(
        getBccrAccountDetails(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual({ error: "Internal Server Error.", status: 500 });
    });

    it("omits the status when the error has none", async () => {
      actionHandler.mockRejectedValueOnce(new Error("fetch failed"));

      await expect(
        getBccrAccountDetails(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual({ error: "fetch failed" });
    });
  });

  describe("getBccrComplianceUnits", () => {
    it("returns the compliance units response", async () => {
      const response = { bccr_compliance_account_id: "COMP123" };
      actionHandler.mockResolvedValueOnce(response);

      await expect(
        getBccrComplianceUnits(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual(response);
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/bccr/accounts/${ACCOUNT_ID}/compliance-report-versions/${COMPLIANCE_REPORT_VERSION_ID}/compliance-units`,
        "GET",
        "",
      );
    });

    it("returns a thrown error as { error }", async () => {
      actionHandler.mockRejectedValueOnce(
        new Error("The system cannot connect to the external application."),
      );

      await expect(
        getBccrComplianceUnits(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual({
        error: "The system cannot connect to the external application.",
      });
    });

    it("returns a generic message for non-Error throws", async () => {
      actionHandler.mockRejectedValueOnce("boom");

      await expect(
        getBccrComplianceUnits(ACCOUNT_ID, COMPLIANCE_REPORT_VERSION_ID),
      ).resolves.toEqual({ error: "An unexpected error occurred." });
    });
  });
});
