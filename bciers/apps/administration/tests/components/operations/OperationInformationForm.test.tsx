import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import OperationInformationForm from "@/administration/app/components/operations/OperationInformationForm";
import {
  actionHandler,
  getOperationWithDocuments,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";

import { createAdministrationOperationInformationSchema } from "apps/administration/app/data/jsonSchema/operationInformation/administrationOperationInformation";
import { Apps, FrontEndRoles, OperationStatus } from "@bciers/utils/src/enums";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import fetchFormEnums from "@bciers/testConfig/helpers/fetchFormEnums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});
useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockDataUri = "data:application/pdf;name=testpdf.pdf;base64,ZHVtbXk=";

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
  activities: [1, 2],
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
  registration_purpose: RegistrationPurposes.REPORTING_OPERATION,
  regulated_products: [2],
  opt_in: false,
};

const optInFormData = {
  name: "Operation 5",
  type: "Single Facility Operation",
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

const newEntrantFormData = {
  name: "Operation 5",
  type: "Single Facility Operation",
  registration_purpose: RegistrationPurposes.NEW_ENTRANT_OPERATION,
  new_entrant_application: mockDataUri,
  date_of_first_shipment: "On or before March 31, 2024",
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

  it("should render the form with the correct values for a non-EIO when formData is provided", async () => {
    fetchFormEnums(Apps.ADMINISTRATION);
    const createdFormSchema =
      await createAdministrationOperationInformationSchema(
        formData.registration_purpose,
        OperationStatus.REGISTERED,
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
    expect(screen.getByText(/Reporting Operation/i)).toBeVisible();
  });

  it("should render the form with the correct form for an EIO when formData is provided", async () => {
    fetchFormEnums(Apps.ADMINISTRATION);
    const createdFormSchema =
      await createAdministrationOperationInformationSchema(
        RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION,
        OperationStatus.REGISTERED,
      );
    render(
      <OperationInformationForm
        formData={{ name: "Operation 3", type: "Electricity Import Operation" }}
        schema={createdFormSchema}
        operationId={operationId}
      />,
    );
    //name
    expect(screen.getByText(/Operation 3/i)).toBeVisible();
    // type
    expect(screen.getByText(/Electricity Import Operation/i)).toBeVisible();
    // primary naics code
    expect(screen.queryByText(/naics/i)).not.toBeInTheDocument();

    // registration info & purpose
    expect(
      screen.getByText(
        /The purpose of this registration is to register as a\:/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/Electricity Import Operation/i)).toBeVisible();
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
      `registration/operations/${operationId}`,
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
      `registration/operations/${operationId}/registration/opted-in-operation-detail`,
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
      /does this operation produce a regulated product listed in table 2 of schedule a\.1 of \?/i,
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
  it("should use formContext to correctly render BORO ID and BCGHG ID widgets", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: FrontEndRoles.CAS_DIRECTOR,
        },
      },
    });

    render(
      <OperationInformationForm
        formData={{
          ...formData,
          registration_purpose: RegistrationPurposes.OBPS_REGULATED_OPERATION,
          status: OperationStatus.REGISTERED,
        }}
        schema={{
          type: "object",
          properties: {
            section1: {
              title: "Section 1",
              type: "object",
              properties: {
                bc_obps_regulated_operation: {
                  type: "string",
                  title: "BORO ID",
                },
                bcghg_id: {
                  type: "string",
                  title: "BCGHGID",
                },
              },
            },
          },
        }}
        operationId={operationId}
      />,
    );

    expect(
      screen.getByRole("button", { name: `＋ Issue BORO ID` }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: `＋ Issue BCGHG ID` }),
    ).toBeVisible();
  });

  it("should not allow non-directors to issue BORO and BCGHG IDs", async () => {
    for (const appRole of ["cas_admin", "cas_analyst", "cas_view_only"]) {
      useSession.mockReturnValue({
        data: {
          user: {
            app_role: appRole,
          },
        },
      });

      render(
        <OperationInformationForm
          formData={{ ...formData, status: OperationStatus.REGISTERED }}
          schema={{
            type: "object",
            properties: {
              section1: {
                title: "Section 1",
                type: "object",
                properties: {
                  bc_obps_regulated_operation: {
                    type: "string",
                    title: "BORO ID",
                  },
                  bcghg_id: {
                    type: "string",
                    title: "BCGHGID",
                  },
                },
              },
            },
          }}
          operationId={operationId}
        />,
      );

      expect(
        screen.queryByRole("button", { name: `＋ Issue BORO ID` }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: `＋ Issue BCGHG ID` }),
      ).not.toBeInTheDocument();
    }
  });

  it("should render the new entrant application information if purpose is new entrant", async () => {
    fetchFormEnums(Apps.ADMINISTRATION);
    getOperationWithDocuments.mockResolvedValueOnce(newEntrantFormData);
    const modifiedSchema = await createAdministrationOperationInformationSchema(
      newEntrantFormData.registration_purpose,
      OperationStatus.REGISTERED,
    );

    const { container } = render(
      <OperationInformationForm
        formData={newEntrantFormData}
        schema={modifiedSchema}
        operationId={operationId}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: /registration information/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        /The purpose of this registration is to register as a\:/i,
      ),
    ).toBeVisible();
    expect(
      container.querySelector("#root_section3_registration_purpose"),
    ).toHaveTextContent("New Entrant Operation");
    expect(
      container.querySelector("#root_section3_new_entrant_preface"),
    ).toHaveTextContent("New Entrant Operation");
    expect(
      screen.getByText(/when is this operation's date of first shipment\?/i),
    ).toBeVisible();
    expect(screen.getByText(/on or before march 31, 2024/i)).toBeVisible();
    expect(
      screen.getByText(/new entrant application and statutory declaration/i),
    ).toBeVisible();
    expect(screen.getByText("testpdf.pdf")).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: /preview/i,
      }),
    ).toHaveAttribute("href", mockDataUri);
  });

  it("should edit and submit the new entrant application form", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });
    const testSchemaWithNewEntrant: RJSFSchema = {
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
          title: "Registration Information",
          type: "object",
          properties: {
            registration_purpose: {
              type: "string",
              enum: ["New Entrant Operation"],
            },
            new_entrant_preface: {
              type: "string",
            },
            date_of_first_shipment: {
              type: "string",
              enum: [
                "On or before March 31, 2024",
                "On or after April 1, 2024",
              ],
            },
            new_entrant_application: {
              type: "string",
              title: "New Entrant Application and Statutory Declaration",
              format: "data-url",
            },
          },
        },
      },
    };
    fetchFormEnums(Apps.ADMINISTRATION);
    getOperationWithDocuments.mockResolvedValueOnce(newEntrantFormData);

    render(
      <OperationInformationForm
        formData={newEntrantFormData}
        schema={testSchemaWithNewEntrant}
        operationId={operationId}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const afterAprilRadioButton = screen.getByLabelText(
      "On or after April 1, 2024",
    );

    await userEvent.click(afterAprilRadioButton);
    const mockFile = new File(["test"], "mock_file.pdf", {
      type: "application/pdf",
    });
    const newEntrantApplicationDocument = screen.getByLabelText(
      /new entrant application and statutory declaration/i,
    );
    await userEvent.upload(newEntrantApplicationDocument, mockFile);
    expect(screen.getByText("mock_file.pdf")).toBeVisible();
    const submitButton = screen.getByRole("button", {
      name: "Submit",
    });
    await userEvent.click(submitButton);
    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      `registration/operations/${operationId}`,
      "PUT",
      "",
      {
        body: JSON.stringify({
          name: "Operation 5",
          type: "Single Facility Operation",
          registration_purpose: "New Entrant Operation",
          date_of_first_shipment: "On or after April 1, 2024",
          new_entrant_application:
            "data:application/pdf;name=mock_file.pdf;base64,dGVzdA==",
        }),
      },
    );
  });

  it("should not allow external users to remove their operation rep", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });

    fetchFormEnums(Apps.ADMINISTRATION);
    const createdFormSchema =
      await createAdministrationOperationInformationSchema(
        formData.registration_purpose,
        OperationStatus.REGISTERED,
      );

    render(
      <OperationInformationForm
        formData={formData}
        schema={createdFormSchema}
        operationId={operationId}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const cancelChipIcon = screen.getAllByTestId("CancelIcon");
    await userEvent.click(cancelChipIcon[2]); // 0-1 are activities
    expect(screen.queryByText(/ivy/i)).not.toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: "Submit",
    });
    await userEvent.click(submitButton);
    expect(actionHandler).toHaveBeenCalledTimes(0);
    expect(screen.getByText(/Must not have fewer than 1 items/i)).toBeVisible();
  });

  it(
    "should allow external users to replace their operation rep",
    { timeout: 100000 },
    async () => {
      const testFormData = {
        name: "Operation 3",
        type: "Single Facility Operation",
        naics_code_id: 1,
        secondary_naics_code_id: 2,
        operation_has_multiple_operators: false,
        activities: [1, 2],
        registration_purpose: RegistrationPurposes.REPORTING_OPERATION,
        regulated_products: [1],
        opt_in: false,
        operation_representatives: [1],
        boundary_map: mockDataUri,
        process_flow_diagram: mockDataUri,
      };
      useSession.mockReturnValue({
        data: {
          user: {
            app_role: "industry_user_admin",
          },
        },
      });

      fetchFormEnums(Apps.ADMINISTRATION);
      const createdFormSchema =
        await createAdministrationOperationInformationSchema(
          testFormData.registration_purpose,
          OperationStatus.REGISTERED,
        );

      render(
        <OperationInformationForm
          formData={testFormData}
          schema={createdFormSchema}
          operationId={operationId}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Edit" }));
      const cancelChipIcon = screen.getAllByTestId("CancelIcon");
      await userEvent.click(cancelChipIcon[2]); // 0-1 are activities
      expect(screen.queryByText(/ivy/i)).not.toBeInTheDocument();
      const operationRepresentativesComboBoxInput = screen.getByRole(
        "combobox",
        {
          name: /Operation Representative(s)*/i,
        },
      );
      const openOperationReps = operationRepresentativesComboBoxInput
        .parentElement?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openOperationReps);
      await userEvent.type(
        operationRepresentativesComboBoxInput,
        "Jack King{enter}",
      );

      const submitButton = screen.getByRole("button", {
        name: "Submit",
      });
      await userEvent.click(submitButton);
      expect(actionHandler).toHaveBeenCalledTimes(1);
      expect(actionHandler).toHaveBeenCalledWith(
        `registration/operations/${operationId}`,
        "PUT",
        "",
        {
          body: JSON.stringify({
            name: "Operation 3",
            type: "Single Facility Operation",
            naics_code_id: 1,
            secondary_naics_code_id: 2,
            activities: [1, 2],
            process_flow_diagram: mockDataUri,
            boundary_map: mockDataUri,
            operation_has_multiple_operators: false,
            registration_purpose: "Reporting Operation",
            operation_representatives: [2],
          }),
        },
      );
    },
  );

  it("should show a note if user navigated to operation from the contacts form", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });
    const mockGet = vi.fn();
    useSearchParams.mockReturnValue({
      get: mockGet,
    });
    mockGet.mockReturnValue("true");
    fetchFormEnums(Apps.ADMINISTRATION);
    const createdFormSchema =
      await createAdministrationOperationInformationSchema(
        formData.registration_purpose,
        OperationStatus.REGISTERED,
      );

    render(
      <OperationInformationForm
        formData={{}}
        schema={createdFormSchema}
        operationId={operationId}
      />,
    );
    expect(
      screen.getByText(
        /To remove the current operation representative, please select a new contact to replace them./i,
      ),
    ).toBeVisible();
  });
});
