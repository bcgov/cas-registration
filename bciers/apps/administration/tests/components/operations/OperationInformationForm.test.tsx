import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import OperationInformationForm from "apps/administration/app/components/operations/OperationInformationForm";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";
import {
  getBusinessStructures,
  getNaicsCodes,
  getOperationWithDocuments,
  getRegulatedProducts,
  getReportingActivities,
} from "./mocks";
import { createAdministrationOperationInformationSchema } from "apps/administration/app/data/jsonSchema/operationInformation/administrationOperationInformation";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

export const fetchFormEnums = () => {
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
      id: 1,
      name: "General stationary combustion excluding line tracing",
      applicable_to: "all",
    },
    {
      id: 2,
      name: "Fuel combustion by mobile equipment",
      applicable_to: "sfo",
    },
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

// Just using a simple schema for testing purposes
const testSchema: RJSFSchema = {
  type: "object",
  properties: {
    section1: {
      title: "Section 1",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Operation Name",
        },
      },
    },
    section2: {
      title: "Section 2",
      type: "object",
      properties: {
        type: {
          type: "string",
          title: "Operation Type",
        },
      },
    },
  },
};

const testSchemaWithOpt: RJSFSchema = {
  type: "object",
  properties: {
    section1: {
      title: "Section 1",
      type: "object",
      properties: {
        name: {
          type: "string",
          title: "Operation Name",
        },
      },
    },
    section2: {
      title: "Section 2",
      type: "object",
      properties: {
        type: {
          type: "string",
          title: "Operation Type",
        },
      },
    },
    section3: {
      title: "Section 3",
      type: "object",
      properties: {
        opted_in_operation: {
          type: "object",
          properties: {
            meets_section_3_emissions_requirements: {
              type: "boolean",
            },
            meets_electricity_import_operation_criteria: {
              type: "boolean",
            },
            meets_entire_operation_requirements: {
              type: "boolean",
            },
            meets_section_6_emissions_requirements: {
              type: "boolean",
            },
            meets_naics_code_11_22_562_classification_requirements: {
              type: "boolean",
            },
            meets_producing_gger_schedule_a1_regulated_product: {
              type: "boolean",
            },
            meets_reporting_and_regulated_obligations: {
              type: "boolean",
            },
            meets_notification_to_director_on_criteria_change: {
              type: "boolean",
            },
          },
        },
      },
    },
  },
};

const formData = {
  name: "Operation 3",
  type: "Single Facility Operation",
  naics_code_id: 1,
  secondary_naics_code_id: 2,
  operation_has_multiple_operators: true,
  registration_purposes: ["Non-Regulated"],
  activities: [1, 2, 3, 4, 5],
  multiple_operators_array: [
    {
      mo_is_extraprovincial_company: false,
      mo_legal_name: "Videl",
      mo_trade_name: "Saiyaman 2",
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
  name: "Operation 5",
  type: "Single Facility Operation",
  registration_purposes: ["Opted-in Operation"],
  registration_purpose: "Opted-in Operation",
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

describe("the OperationInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the OperationInformationForm component", async () => {
    render(
      <OperationInformationForm
        formData={{}}
        schema={testSchema}
        operationId={operationId}
      />,
    );

    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  it("should render the form with the correct values when formData is provided", async () => {
    fetchFormEnums();
    const createdFormSchema =
      await createAdministrationOperationInformationSchema(
        formData.registration_purposes,
        false,
      );
    render(
      <OperationInformationForm
        formData={formData}
        schema={createdFormSchema}
        operationId={operationId}
      />,
    );
    //name
    expect(screen.getByText(/Operation 3/i)).toBeVisible();
    // type
    expect(screen.getByText(/Single Facility Operation/i)).toBeVisible();
    // primary naics code
    expect(screen.getByText(/Oil and gas extraction/i)).toBeVisible();
    // secondary
    expect(screen.getByText(/Bituminous coal mining/i)).toBeVisible();
    // reporting activities
    expect(screen.getByText(/Reporting Activities/i)).toBeVisible();
    expect(screen.getByText(/General stationary combustion/i)).toBeVisible();
    // 2 file inputs
    expect(screen.getByText(/Process Flow Diagram/i)).toBeVisible();
    expect(screen.getByText(/Boundary Map/i)).toBeVisible();
    expect(screen.getAllByText(/No attachment was uploaded/i)).toHaveLength(2);
    // multiple operators
    expect(
      screen.getByText(/Does the operation have multiple operators/i),
    ).toBeVisible();
    expect(screen.getByText(/Yes/i)).toBeVisible();
    expect(screen.getByText(/Videl/i)).toBeVisible(); // legal name
    expect(screen.getByText(/Saiyaman 2/i)).toBeVisible(); // trade name
    expect(screen.getByText(/BC Corporation/i)).toBeVisible(); // business structure
    expect(screen.getByText(/0123456789/i)).toBeVisible(); // business number
    expect(screen.getByText(/abc0123456/i)).toBeVisible(); // registry number
    expect(screen.getByText(/test st/i)).toBeVisible(); // adress
    expect(screen.getByText(/Victoria/i)).toBeVisible(); //municipality
    expect(screen.getByText(/British Columbia/i)).toBeVisible(); // province
    expect(screen.getByText(/V1V1V1/i)).toBeVisible(); // postal code

    // registration info & purpose
    expect(
      screen.getByText(
        /The purpose of this registration is to register as a\:/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/Non-Regulated/i)).toBeVisible();
  });

  it("should enable editing when the Edit button is clicked", async () => {
    render(
      <OperationInformationForm
        formData={formData}
        schema={testSchema}
        operationId={operationId}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();

    await act(async () => {
      // Click the Edit button
      screen.getByRole("button", { name: "Edit" }).click();
    });

    // Expect the Edit button to be disabled
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
  });

  it("should edit and submit the form", async () => {
    render(
      <OperationInformationForm
        formData={formData}
        schema={testSchema}
        operationId={operationId}
      />,
    );

    await act(async () => {
      // Click the Edit button
      screen.getByRole("button", { name: "Edit" }).click();
    });

    // Fill out the form
    const nameInput = screen.getByLabelText(/Operation Name/i);

    expect(nameInput).toHaveValue("Operation 3");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Operation 4" } });
    });

    // Click the Submit button
    await act(async () => {
      screen.getByRole("button", { name: "Submit" }).click();
    });

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/v2/operations/${operationId}`,
      "PUT",
      "",
      {
        body: JSON.stringify({
          name: "Operation 4",
          type: "Single Facility Operation",
        }),
      },
    );

    // Expect the form to be submitted
    expect(screen.getByText(/Operation 4/i)).toBeVisible();
  });

  it("should edit and submit opt-in operation details in the form", async () => {
    render(
      <OperationInformationForm
        formData={optInFormData}
        schema={testSchemaWithOpt}
        operationId={operationId}
      />,
    );

    await act(async () => {
      // Click the Edit button
      screen.getByRole("button", { name: "Edit" }).click();
    });
    await act(async () => {
      // Grab all radio buttons
      const allNoRadioButtons: HTMLInputElement[] = screen.getAllByRole(
        "radio",
        {
          name: /no/i,
        },
      );

      // Change all to no
      allNoRadioButtons.forEach((radioBtn) => {
        radioBtn.click();
      });
      allNoRadioButtons.forEach((radioBtn) => {
        expect(radioBtn).toBeChecked();
      });

      // Click the Submit button
      screen.getByRole("button", { name: "Submit" }).click();
    });

    expect(actionHandler).toHaveBeenCalledTimes(2);
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/v2/operations/${operationId}/registration/opted-in-operation-detail`,
      "PUT",
      "",
      {
        body: JSON.stringify({
          meets_section_3_emissions_requirements: false,
          meets_electricity_import_operation_criteria: false,
          meets_entire_operation_requirements: false,
          meets_section_6_emissions_requirements: false,
          meets_naics_code_11_22_562_classification_requirements: false,
          meets_producing_gger_schedule_a1_regulated_product: false,
          meets_reporting_and_regulated_obligations: false,
          meets_notification_to_director_on_criteria_change: false,
        }),
      },
    );

    // Expect the form to contain no for each opt in criteria
    await act(async () => {
      const allNoText = screen.getAllByText(/no/i);

      allNoText.forEach((radioValue) => {
        expect(radioValue).toHaveTextContent(/no/i);
      });
    });
  });

  it("should render the form in read-only mode and not show Edit/Submit button if the user is not an industry_user_admin", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });

    render(
      <OperationInformationForm
        formData={formData}
        schema={testSchema}
        operationId={operationId}
      />,
    );

    // There is no textbox element in the form
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit" }),
    ).not.toBeInTheDocument();
    // still show the cancel button
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  it("should render the opt-in information if purpose is opt-in", async () => {
    getOperationWithDocuments.mockResolvedValueOnce(optInFormData);

    render(
      <OperationInformationForm
        formData={optInFormData}
        schema={testSchemaWithOpt}
        operationId={operationId}
      />,
    );

    expect(screen.getByText(/Operation 5/i)).toBeVisible();
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
