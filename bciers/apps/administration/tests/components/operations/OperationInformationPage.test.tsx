import { render, screen, within } from "@testing-library/react";
import OperationInformationPage from "apps/administration/app/components/operations/OperationInformationPage";
import {
  getOperationWithDocuments,
  getNaicsCodes,
  getReportingActivities,
  getBusinessStructures,
  getRegulatedProducts,
} from "./mocks";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const fetchFormEnums = () => {
  // Naics codes
  getNaicsCodes.mockResolvedValue([
    {
      id: 1,
      naics_code: "211110",
      naics_description: "Oil and gas extraction (except oil sands)",
    },
    {
      id: 2,
      naics_code: "212114",
      naics_description: "Bituminous coal mining",
    },
  ]);
  // Reporting activities
  getReportingActivities.mockResolvedValue([
    {
      name: "General stationary combustion excluding line tracing",
      applicable_to: "all",
    },
    { name: "Fuel combustion by mobile equipment", applicable_to: "sfo" },
  ]);

  // Business structures
  getBusinessStructures.mockResolvedValue([
    { name: "General Partnership" },
    { name: "BC Corporation" },
  ]);

  // Regulated products
  getRegulatedProducts.mockResolvedValue([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
  ]);

  // Registration purposes
  actionHandler.mockResolvedValue(["Potential Reporting Operation"]);
};

const formData = {
  name: "Operation 3",
  type: "Single Facility Operation",
  naics_code_id: 1,
  secondary_naics_code_id: 2,
  operation_has_multiple_operators: true,
  registration_purposes: ["Non-Regulated"],
  multiple_operators_array: [
    {
      mo_is_extraprovincial_company: false,
      mo_legal_name: "Test",
      mo_trade_name: "User",
      mo_business_structure: "BC Corporation",
      mo_cra_business_number: "0123456789",
      mo_bc_corporate_registry_number: "abc0123456",
      mo_attorney_street_address: "test st",
      mo_municipality: "Victoria",
      mo_province: "BC",
      mo_postal_code: "V1V1V1",
    },
  ],
  registration_purpose: "Non-Regulated",
  regulated_products: [6],
  opt_in: false,
};

const optInFormData = {
  name: "Operation 4",
  type: "Single Facility Operation",
  naics_code_id: 1,
  secondary_naics_code_id: 2,
  operation_has_multiple_operators: false,
  registration_purposes: ["Opted-in Operation"],
  registration_purpose: "Opted-in Operation",
  regulated_products: [6],
  opted_in_operation: {
    meets_section_3_emissions_requirements: true,
    meets_electricity_import_operation_criteria: true,
    meets_entire_operation_requirements: true,
    meets_section_6_emissions_requirements: true,
    meets_naics_code_11_22_562_classification_requirements: true,
    meets_producing_gger_schedule_a1_regulated_product: true,
    meets_reporting_and_regulated_obligations: true,
    meets_notification_to_director_on_criteria_change: true,
  },
  opt_in: true,
};

const operationId = "8be4c7aa-6ab3-4aad-9206-0ef914fea063";

describe("the OperationInformationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the OperationInformationPage component", async () => {
    fetchFormEnums();
    getOperationWithDocuments.mockResolvedValueOnce(formData);
    render(await OperationInformationPage({ operationId }));

    expect(
      screen.getByRole("heading", { name: "Operation Information" }),
    ).toBeVisible();
    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();
    expect(screen.getByText(/Primary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Secondary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Tertiary NAICS Code/i)).toBeVisible();
    expect(screen.getByText(/Reporting Activities/i)).toBeVisible();
    expect(screen.getByText(/Process Flow Diagram/i)).toBeVisible();
    expect(screen.getByText(/Boundary Map/i)).toBeVisible();

    expect(
      screen.getByRole("heading", { name: "Multiple Operators Information" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Does the operation have multiple operators?/i),
    ).toBeVisible();

    expect(
      screen.getByRole("heading", { name: "Registration Information" }),
    ).toBeVisible();
    expect(
      screen.getByText(/The purpose of this registration+/i),
    ).toBeVisible();
  });

  it("should render the form with the correct values when formData is provided", async () => {
    fetchFormEnums();
    getOperationWithDocuments.mockResolvedValueOnce(formData);

    render(await OperationInformationPage({ operationId }));

    expect(screen.getByText(/Operation 3/i)).toBeVisible();
    expect(screen.getByText(/Single Facility Operation/i)).toBeVisible();
    expect(
      screen.getByText(/211110 - Oil and gas extraction \(except oil sands\)/i),
    ).toBeVisible();
    expect(screen.getByText(/212114 - Bituminous coal mining/i)).toBeVisible();

    // Will add remaining tests for the form fields, though waiting on fix for nesting formData
    // that is coming in another PR since the multiple operators data is not going in
  });

  it("should render the opt-in information if purpose is opt-in", async () => {
    vi.clearAllMocks();
    fetchFormEnums();
    getOperationWithDocuments.mockResolvedValueOnce(optInFormData);

    render(await OperationInformationPage({ operationId }));

    expect(screen.getByText(/Operation 4/i)).toBeVisible();
    // Questions - 1 (borrowed from operations form tests)
    const meetsSection3EmissionsRequirementsView = screen.getByText(
      /does this operation have emissions that are attributable for the purposes of section 3 of \?/i,
    );
    within(meetsSection3EmissionsRequirementsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[0],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 2
    expect(
      screen.getByText(/is this operation an electricity import operation\?/i),
    ).toBeVisible();

    // Questions - 3
    expect(
      screen.getByText(
        /designation as an opt-in can only be granted to an entire operation \(i\.e\. not a part or certain segment of an operation\)\. do you confirm that the operation applying for this designation is an entire operation\?/i,
      ),
    ).toBeVisible();

    // Questions - 4
    const meetsSection6EmissionsRequirementsView = screen.getByText(
      /does this operation have emissions that are attributable for the purposes of section 6 of \?/i,
    );

    within(meetsSection6EmissionsRequirementsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[1],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 5
    const meetsNaicsCode1122562ClassificationRequirementsView =
      screen.getByText(
        /is this operation’s primary economic activity classified by the following/i,
      );

    within(meetsNaicsCode1122562ClassificationRequirementsView).getByRole(
      "link",
      {
        name: /naics code - 11, 22, or 562\?/i,
      },
    );

    expect(
      screen.getByRole("link", {
        name: /naics code - 11, 22, or 562\?/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.statcan.gc.ca/en/subjects/standard/naics/2022/v1/index",
    );

    // Questions - 6
    const meetsProducingGgerScheduleA1RegulatedProductView = screen.getByText(
      /does this operation produce a regulated product listed in table 1 of schedule a\.1 of \?/i,
    );
    within(meetsProducingGgerScheduleA1RegulatedProductView).getByRole("link", {
      name: /the ggerr/i,
    });

    expect(
      screen.getByRole("link", {
        name: /the ggerr/i,
      }),
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015",
    );

    // Questions - 7
    const meetsReportingAndRegulatedObligationsView = screen.getByText(
      /is this operation capable of fulfilling the obligations of a reporting operation and a regulated operation under and the regulations\?/i,
    );
    within(meetsReportingAndRegulatedObligationsView).getByRole("link", {
      name: /the act/i,
    });
    expect(
      screen.getAllByRole("link", {
        name: /the act/i,
      })[2],
    ).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );

    // Questions - 8
    expect(
      screen.getByText(
        /will the operator notify the director as soon as possible if this operation ceases to meet any of the criteria for the designation of the operation as a reporting operation and a regulated operation\?/i,
      ),
    );
  });
});
