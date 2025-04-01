// import { actionHandler } from "@bciers/actions";

/**
 * Fetches compliance units apply data from the backend
 * This is a temporary mock implementation until the backend is ready
 */
export const getComplianceUnitsApplyData = async () => {
  // TODO: Uncomment this code after the backend is implemented
  /*
    const data = await actionHandler(
        `compliance/summaries/${complianceSummaryId}/apply-units`,
        "GET",
        "",
    );

    if (data?.error) {
        throw new Error(`Failed to fetch compliance units data: ${data.error}`);
    }

    if (!data || typeof data !== "object") {
        throw new Error(
            "Invalid response format from compliance units endpoint",
        );
    }

    return data;
    */

  const mock = {
    bccrTradingName: "Colour Co.",
    obpsComplianceAccountId: "273563474850372",
    validBccrHoldingAccountId: "123456789012345",

    reporting_year: 2024,
  };

  return mock;
};
