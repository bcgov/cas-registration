import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import {
  useSessionRole,
  useRouter,
  getRegulatedProducts,
  getRegistrationPurposes,
  getNaicsCodes,
  getReportingActivities,
  getBusinessStructures,
  fetchOperationsPageData,
} from "@bciers/testConfig/mocks";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import {
  allOperationRegistrationSteps,
  RegistrationPurposeHelpText,
} from "@/registration/app/components/operations/registration/enums";
import userEvent from "@testing-library/user-event";
import { actionHandler } from "@bciers/testConfig/mocks";
import { createRegistrationOperationInformationSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import { mockDataUri } from "./NewEntrantOperationForm.test";
import { fillComboboxWidgetField } from "@bciers/testConfig/helpers/helpers";
import fetchFormEnums from "@bciers/testConfig/helpers/fetchFormEnums";
import { Apps } from "@bciers/utils/src/enums";
import { bcObpsGuidanceLink } from "@bciers/utils/src/urls";

const mockPush = vi.fn();
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

describe("the OperationInformationForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("industry_user_admin");

    useRouter.mockReturnValue({
      query: {},
      push: mockPush,
    });
  });

  it("should render the OperationInformationForm component", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
    expect(
      screen.getByRole("button", { name: /save and continue/i }),
    ).toBeVisible();
    expect(screen.getByText(/program and reporting guidance/i)).toHaveAttribute(
      "href",
      bcObpsGuidanceLink,
    );
  });

  it(
    "should fetch operation data when an existing operation is selected",
    { timeout: 10000 },
    async () => {
      fetchFormEnums(Apps.REGISTRATION);
      actionHandler.mockResolvedValueOnce({
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Operation 1",
        registration_purpose: "Electricity Import Operation",
        operation_has_multiple_operators: true,
        multiple_operators_array: [
          {
            mo_is_extraprovincial_company: false,
            mo_legal_name: "mops 1",
            mo_trade_name: "ads",
            mo_cra_business_number: 555555555,
            mo_bc_corporate_registry_number: "aaa5555555",
            mo_business_structure: "Sole Proprietorship",
            mo_attorney_street_address: "ads",
            mo_municipality: "ad",
            mo_province: "NS",
            mo_postal_code: "H0H0H0",
            id: 2,
          },
          {
            mo_is_extraprovincial_company: true,
            mo_legal_name: "mops 2",
            mo_trade_name: "ads",
            mo_cra_business_number: 666666666,
            mo_business_structure: "General Partnership",
            mo_attorney_street_address: "ad",
            mo_municipality: "ad",
            mo_province: "NS",
            mo_postal_code: "H0H0H0",
            id: 3,
          },
        ],
      }); // mock the GET from selecting an operation
      render(
        <OperationInformationForm
          rawFormData={{}}
          schema={await createRegistrationOperationInformationSchema()}
          step={1}
          steps={allOperationRegistrationSteps}
        />,
      );
      const selectOperationInput = screen.getByLabelText(
        /select your operation+/i,
      );
      await fillComboboxWidgetField(selectOperationInput, /Operation 1/i);

      await waitFor(() => {
        // LastCalledWith because fetchFormEnums calls the actionHandler multiple times to populate the dropdown options in the form schema
        expect(actionHandler).toHaveBeenLastCalledWith(
          "registration/operations/uuid1/registration/operation",
          "GET",
          "",
        );
      });

      await waitFor(() => {
        // spot check section 1
        expect(
          screen.getByLabelText(
            /The purpose of this registration is to register as a:+/i,
          ),
        ).toHaveValue("Electricity Import Operation");

        // spot check section 2
        expect(screen.getByLabelText(/Operation name+/i)).toHaveValue(
          "Operation 1",
        );

        // spot check section 3
        const multipleOperatorLegalNames =
          screen.getAllByLabelText(/legal name+/i);

        expect(multipleOperatorLegalNames).toHaveLength(2);

        expect(multipleOperatorLegalNames[0]).toHaveValue("mops 1");
        expect(multipleOperatorLegalNames[1]).toHaveValue("mops 2");
      });
    },
  );

  it(
    "should submit an edited operation without regulated products",
    {
      timeout: 20000,
    },
    async () => {
      fetchFormEnums(Apps.REGISTRATION); // mock actionHandler calls to populate dropdown options

      actionHandler.mockResolvedValueOnce({
        operation: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Existing Operation",
        type: "Single Facility Operation",
        naics_code_id: 1,
        boundary_map: mockDataUri,
        process_flow_diagram: mockDataUri,
        registration_purpose: "Reporting Operation",
        activities: [1],
      }); // mock the GET from selecting an operation

      actionHandler.mockResolvedValueOnce({
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Existing Operation edited",
      }); // mock the POST response from the submit handler

      render(
        <OperationInformationForm
          rawFormData={{}}
          schema={await createRegistrationOperationInformationSchema()}
          step={1}
          steps={allOperationRegistrationSteps}
        />,
      );

      const operationInput = screen.getByLabelText(/Select your operation+/i);
      await fillComboboxWidgetField(operationInput, "Existing Operation");

      // assert the mocked GET values are in the form
      await waitFor(() => {
        expect(screen.getByLabelText(/Operation name+/i)).toHaveValue(
          "Existing Operation",
        );
        expect(screen.getByLabelText(/Operation type+/i)).toHaveValue(
          "Single Facility Operation",
        );
        expect(screen.getByLabelText(/Primary naics+/i)).toHaveValue(
          "211110 - Oil and gas extraction (except oil sands)",
        );

        expect(screen.getAllByText(/testpdf.pdf/i)).toHaveLength(2);
        expect(
          screen.getAllByRole("link", {
            name: /preview/i,
          }),
        ).toHaveLength(2);
      });
      // edit one of the pre-filled values

      await userEvent.type(
        screen.getByLabelText(/Operation name+/i),
        " edited",
      );
      expect(screen.getByLabelText(/Operation name+/i)).toHaveValue(
        "Existing Operation edited",
      );
      // submit
      await userEvent.click(
        screen.getByRole("button", { name: /save and continue/i }),
      );

      await waitFor(() => {
        // LastCalledWith because we mock the actionHandler multiple times to populate the dropdown options and operation info
        expect(actionHandler).toHaveBeenLastCalledWith(
          "registration/operations/b974a7fc-ff63-41aa-9d57-509ebe2553a4/registration/operation",
          "PUT",
          "",
          {
            body: JSON.stringify({
              registration_purpose: "Reporting Operation",
              operation: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
              activities: [1],
              name: "Existing Operation edited",
              type: "Single Facility Operation",
              naics_code_id: 1,
              process_flow_diagram:
                "data:application/pdf;name=testpdf.pdf;scanstatus=Clean;base64,ZHVtbXk=",
              boundary_map:
                "data:application/pdf;name=testpdf.pdf;scanstatus=Clean;base64,ZHVtbXk=",
              operation_has_multiple_operators: false,
            }),
          },
        );

        expect(mockPush).toHaveBeenCalledWith(
          `/register-an-operation/b974a7fc-ff63-41aa-9d57-509ebe2553a4/2?operations_title=${encodeURIComponent(
            "Existing Operation edited",
          )}`,
        );
      });
    },
  );

  it(
    "should submit a new OBPS regulated operation with regulated products and multiple operators",
    {
      timeout: 60000,
    },
    async () => {
      fetchFormEnums(Apps.REGISTRATION);
      actionHandler.mockResolvedValueOnce({
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Picklejuice",
      }); // mock the POST response from the submit handler
      render(
        <OperationInformationForm
          rawFormData={{}}
          schema={await createRegistrationOperationInformationSchema()}
          step={1}
          steps={allOperationRegistrationSteps}
        />,
      );

      const purposeInput = screen.getByRole("combobox", {
        name: /The purpose of this registration+/i,
      });
      await fillComboboxWidgetField(purposeInput, "OBPS Regulated Operation");

      const regulatedProductsInput = screen.getByPlaceholderText(
        /select regulated product.../i,
      );
      const openProductsDropdown = regulatedProductsInput?.parentElement
        ?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openProductsDropdown);
      const product1 = screen.getByText(
        "BC-specific refinery complexity throughput",
      );
      await userEvent.click(product1);
      await userEvent.click(openProductsDropdown);
      const product2 = screen.getByText("Cement equivalent");
      await userEvent.click(product2);

      // activities
      const reportingActivitiesInput = screen.getByPlaceholderText(
        /select reporting activity.../i,
      );

      const openActivitiesDropdown = reportingActivitiesInput?.parentElement
        ?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openActivitiesDropdown);
      const activityOption = screen.getByText("Cement production");
      await userEvent.click(activityOption);

      // add a new operation
      await userEvent.type(screen.getByLabelText(/Operation Name/i), "Op Name");

      // operation type
      const operationType = screen.getByRole("combobox", {
        name: /Operation Type+/i,
      });
      act(() => {
        userEvent.click(operationType);
      });

      await waitFor(() => {
        userEvent.click(
          screen.getByRole("option", { name: "Single Facility Operation" }),
        );
      });

      // naics
      const primaryNaicsInput = screen.getByPlaceholderText(/primary naics+/i);
      await fillComboboxWidgetField(
        primaryNaicsInput,
        /Oil and gas extraction+/i,
      );

      // upload attachment
      const processFlowDiagramInput = screen.getByLabelText(/process flow+/i);
      await userEvent.upload(processFlowDiagramInput, mockFile);

      const boundaryMapInput = screen.getByLabelText(/boundary map+/i);
      await userEvent.upload(boundaryMapInput, mockFile);

      // add multiple operator
      await userEvent.click(
        screen.getByLabelText(/Does the operation have multiple operators?/i),
      );

      await userEvent.type(screen.getByLabelText(/Legal Name+/i), "edit");
      await userEvent.type(screen.getByLabelText(/Trade Name+/i), "edit");

      // business structure
      const businessStructureInput = screen.getByRole("combobox", {
        name: /business structure+/i,
      });
      await fillComboboxWidgetField(businessStructureInput, /BC Corporation/i);

      await userEvent.clear(screen.getByLabelText(/CRA Business Number+/i));
      await userEvent.type(
        screen.getByLabelText(/CRA Business Number+/i),
        "999999999",
      );
      await userEvent.clear(
        screen.getByLabelText(/BC Corporate Registry Number+/i),
      );
      await userEvent.type(
        screen.getByLabelText(/BC Corporate Registry Number+/i),
        "zzz9999999",
      );

      await userEvent.type(
        screen.getByLabelText(/Attorney street address+/i),
        "edit",
      );
      await userEvent.type(screen.getByLabelText(/Municipality+/i), "edit");
      // province
      const provinceComboBoxInput = screen.getByRole("combobox", {
        name: /province/i,
      });
      await fillComboboxWidgetField(provinceComboBoxInput, /alberta/i);
      await userEvent.type(screen.getByLabelText(/Postal Code+/i), "A1B 2C3");

      // submit

      await userEvent.click(
        screen.getByRole("button", { name: /save and continue/i }),
      );
      await waitFor(() => {
        expect(actionHandler).toHaveBeenLastCalledWith(
          "registration/operations",
          "POST",
          "",
          {
            body: JSON.stringify({
              registration_purpose: "OBPS Regulated Operation",
              regulated_products: [1, 2],
              activities: [2],
              name: "Op Name",
              type: "Single Facility Operation",
              naics_code_id: 1,
              process_flow_diagram:
                "data:application/pdf;name=test.pdf;base64,dGVzdA==",
              boundary_map:
                "data:application/pdf;name=test.pdf;base64,dGVzdA==",
              operation_has_multiple_operators: true,
              multiple_operators_array: [
                {
                  mo_is_extraprovincial_company: false,
                  mo_legal_name: "edit",
                  mo_trade_name: "edit",
                  mo_business_structure: "BC Corporation",
                  mo_cra_business_number: 999999999,
                  mo_attorney_street_address: "edit",
                  mo_municipality: "edit",
                  mo_province: "AB",
                  mo_postal_code: "A1B2C3",
                  mo_bc_corporate_registry_number: "zzz9999999",
                },
              ],
            }),
          },
        );
      });
      expect(mockPush).toHaveBeenCalledWith(
        "/register-an-operation/b974a7fc-ff63-41aa-9d57-509ebe2553a4/2?operations_title=Picklejuice",
      );
    },
  );

  it(
    "should submit a new EIO operation",
    {
      timeout: 60000,
    },
    async () => {
      fetchFormEnums(Apps.REGISTRATION);
      actionHandler.mockResolvedValueOnce({
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "EIO Op Name",
      }); // mock the POST response from the submit handler
      render(
        <OperationInformationForm
          rawFormData={{}}
          schema={await createRegistrationOperationInformationSchema()}
          step={1}
          steps={allOperationRegistrationSteps}
        />,
      );

      const purposeInput = screen.getByRole("combobox", {
        name: /The purpose of this registration+/i,
      });
      await fillComboboxWidgetField(
        purposeInput,
        "Electricity Import Operation",
      );

      await userEvent.type(
        screen.getByLabelText(/Operation Name/i),
        "EIO Op Name",
      );

      // EIO is the default operation type if purpose is EIO so we don't have to fill it in

      // submit

      await userEvent.click(
        screen.getByRole("button", { name: /save and continue/i }),
      );
      await waitFor(() => {
        expect(actionHandler).toHaveBeenLastCalledWith(
          "registration/operations",
          "POST",
          "",
          {
            body: JSON.stringify({
              registration_purpose: "Electricity Import Operation",
              name: "EIO Op Name",
              type: "Electricity Import Operation",
              operation_has_multiple_operators: false,
            }),
          },
        );
      });
      expect(mockPush).toHaveBeenCalledWith(
        "/register-an-operation/b974a7fc-ff63-41aa-9d57-509ebe2553a4/2?operations_title=EIO%20Op%20Name",
      );
    },
  );

  it("should show the correct help text when selecting a purpose", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    const purposeInput = screen.getByRole("combobox", {
      name: /The purpose of this registration+/i,
    });
    await fillComboboxWidgetField(
      purposeInput,
      "Potential Reporting Operation",
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          RegistrationPurposeHelpText["Potential Reporting Operation"],
        ),
      ).toBeVisible();
    });
  });

  it("should show the confirmation modal when the selected purpose changes", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    const purposeInput = screen.getByRole("combobox", {
      name: /The purpose of this registration+/i,
    });
    await fillComboboxWidgetField(purposeInput, "Reporting Operation");

    await waitFor(() => {
      expect(
        screen.getByText(RegistrationPurposeHelpText["Reporting Operation"]),
      ).toBeVisible();
    });
    await userEvent.clear(purposeInput);
    await fillComboboxWidgetField(purposeInput, "OBPS Regulated Operation");
    await waitFor(() => {
      expect(
        screen.getByText(
          /Are you sure you want to change your registration purpose+/i,
        ),
      ).toBeVisible();
    });
    await userEvent.click(
      screen.getByRole("button", { name: /Change registration purpose/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          RegistrationPurposeHelpText["OBPS Regulated Operation"],
        ),
      ).toBeVisible();
    });
  });

  it("should show the confirmation modal when the selected type changes", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      <OperationInformationForm
        rawFormData={{ type: "Single Facility Operation" }}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    const operationType = screen.getByRole("combobox", {
      name: /Operation Type+/i,
    });

    act(() => {
      userEvent.click(operationType);
    });

    await waitFor(() => {
      userEvent.click(
        screen.getByRole("option", { name: "Linear Facilities Operation" }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Are you sure you want to change your operation type+/i,
        ),
      ).toBeVisible();
    });
    await userEvent.click(
      screen.getByRole("button", { name: /Change operation type/i }),
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/operation type*/i)).toHaveValue(
        "Linear Facilities Operation",
      );
    });
  });

  it("should trigger validation errors", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /save and continue/i }),
    );
    expect(screen.getAllByRole("alert")).toHaveLength(9);
    expect(
      screen.getByText(
        /Select an operation or add a new operation in the form below/i,
      ),
    ).toBeVisible();
  });
  it("should not raise an error when we pass an empty array to anyOf (operation has empty array in response)", async () => {
    // listen for console warnings
    const consoleErrorMock = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // // repeat the fetchFormEnums, except this time we will mock the operation response to have an empty array
    // Regulated products
    getRegulatedProducts.mockResolvedValueOnce([
      { id: 1, name: "BC-specific refinery complexity throughput" },
      { id: 2, name: "Cement equivalent" },
    ]);
    // Purposes
    getRegistrationPurposes.mockResolvedValueOnce([
      "Reporting Operation",
      "Potential Reporting Operation",
      "Electricity Import Operation",
    ]);
    // Naics codes
    getNaicsCodes.mockResolvedValueOnce([
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
    getReportingActivities.mockResolvedValueOnce([
      { id: 1, name: "Ammonia production" },
      { id: 2, name: "Cement production" },
    ]);
    // Business structures
    getBusinessStructures.mockResolvedValueOnce([
      { name: "General Partnership" },
      { name: "BC Corporation" },
    ]);

    fetchOperationsPageData.mockResolvedValueOnce([]);

    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    // make sure the error was not logged(before fixing the issue we would see this error)
    expect(consoleErrorMock).not.toHaveBeenCalledWith(
      "Error encountered compiling schema:",
      expect.objectContaining({
        message: expect.stringContaining(
          "schema is invalid: data/properties/section1/properties/operation/anyOf must NOT have fewer than 1 items",
        ),
      }),
    );
    consoleErrorMock.mockRestore();
  });
});
