import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession, useRouter } from "@bciers/testConfig/mocks";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import userEvent from "@testing-library/user-event";
import { actionHandler } from "@bciers/testConfig/mocks";
import { fetchFormEnums } from "../OperationRegistrationPage.test";
import { createRegistrationOperationInformationSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import { mockDataUri } from "./NewEntrantOperationForm.test";

const mockPush = vi.fn();
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

describe("the OperationInformationForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });

    useRouter.mockReturnValue({
      query: {},
      push: mockPush,
    });
  });

  it("should render the OperationInformationForm component", async () => {
    fetchFormEnums();
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
  });

  it("should fetch operation data when an existing operation is selected", async () => {
    fetchFormEnums();
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
    const openSelectOperationDropdown = selectOperationInput?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openSelectOperationDropdown);
    const operationOption = screen.getByText(/Operation 1/i);
    act(() => {
      userEvent.click(operationOption);
    });

    await waitFor(() => {
      // 7th call because fetchFormEnums calls the actionHandler 6 times to populate the dropdown options in the form schema
      expect(actionHandler).toHaveBeenNthCalledWith(
        7,
        "registration/operations/uuid1",
        "GET",
        "",
      );
    });
  });

  it("should submit when a purpose without regulated products is selected for an existing operation", async () => {
    fetchFormEnums(); // mock actionHandler calls to populate dropdown options
    render(
      <OperationInformationForm
        // giving formData mocks having selected an existing operation and `handleSelectOperationChange`
        rawFormData={{
          registration_purpose: "Potential Reporting Operation",
          operation: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
          naics_code_id: 1,
          name: "Operation 14",
          type: "Single Facility Operation",
          boundary_map: mockDataUri,
          process_flow_diagram: mockDataUri,
          equipment_list: mockDataUri,
        }}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(
      screen.queryByPlaceholderText(/select regulated product/i),
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      // mock response from submit handler
      actionHandler.mockResolvedValueOnce({
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Operation 14",
      });
      // LastCalledWith because fetchFormEnums calls the actionHandler multiple times to populate the dropdown options in the form schema
      expect(actionHandler).toHaveBeenLastCalledWith(
        "registration/v2/operations/b974a7fc-ff63-41aa-9d57-509ebe2553a4/registration/operation",
        "PUT",
        "",
        {
          body: JSON.stringify({
            registration_purpose: "Potential Reporting Operation",
            operation: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
            name: "Operation 14",
            type: "Single Facility Operation",
            naics_code_id: 1,
            activities: [],
            process_flow_diagram:
              "data:application/pdf;name=testpdf.pdf;base64,ZHVtbXk=",
            boundary_map:
              "data:application/pdf;name=testpdf.pdf;base64,ZHVtbXk=",
            equipment_list:
              "data:application/pdf;name=testpdf.pdf;base64,ZHVtbXk=",
            operation_has_multiple_operators: false,
          }),
        },
      );

      expect(mockPush).toHaveBeenCalledWith(
        "/register-an-operation/b974a7fc-ff63-41aa-9d57-509ebe2553a4/2?title=Operation 14",
      );
    });
  });

  it(
    "should submit a new operation with regulated products and multiple operators",
    {
      timeout: 20000,
    },
    async () => {
      fetchFormEnums();
      actionHandler.mockReturnValueOnce({ id: "uuid2", name: "Operation 2" });
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

      const openPurposeDropdownButton = purposeInput?.parentElement?.children[1]
        ?.children[0] as HTMLInputElement;

      await userEvent.click(openPurposeDropdownButton);
      const purposeOption = screen.getByText("OBPS Regulated Operation");
      await userEvent.click(purposeOption);

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

      // add a new operation
      await userEvent.type(screen.getByLabelText(/Operation Name/i), "Op Name");

      // operation type
      const operationType = screen.getByRole("combobox", {
        name: /Operation Type+/i,
      });
      act(() => {
        userEvent.click(operationType);
      });

      waitFor(() => {
        userEvent.click(
          screen.getByRole("option", { name: "Single Facility Operation" }),
        );
      });

      // naics
      const primaryNaicsInput = screen.getByPlaceholderText(/primary naics+/i);
      const openNaicsDropdownButton = primaryNaicsInput?.parentElement
        ?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openNaicsDropdownButton);
      const naicsOption = screen.getByText(/Oil and gas extraction+/i);
      await userEvent.click(naicsOption);

      // activities
      const reportingActivitiesInput = screen.getByPlaceholderText(
        /select reporting activity.../i,
      );

      const openActivitiesDropdown = reportingActivitiesInput?.parentElement
        ?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openActivitiesDropdown);
      const activityOption = screen.getByText("Cement production");
      await userEvent.click(activityOption);

      // upload attachment
      const processFlowDiagramInput = screen.getByLabelText(/process flow+/i);
      await userEvent.upload(processFlowDiagramInput, mockFile);

      const boundaryMapInput = screen.getByLabelText(/boundary map+/i);
      await userEvent.upload(boundaryMapInput, mockFile);

      const equipmentListInput = screen.getByLabelText(/equipment list+/i);
      await userEvent.upload(equipmentListInput, mockFile);

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

      const openBusinessSTrcutureDropdownButton = businessStructureInput
        ?.parentElement?.children[1]?.children[0] as HTMLInputElement;

      await userEvent.click(openBusinessSTrcutureDropdownButton);
      const businessStructureOption = screen.getByText("BC Corporation");
      await userEvent.click(businessStructureOption);

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
      const openProvinceDropdownButton = provinceComboBoxInput.parentElement
        ?.children[1]?.children[0] as HTMLInputElement;
      await userEvent.click(openProvinceDropdownButton);
      await userEvent.click(screen.getByText(/alberta/i));
      await userEvent.type(screen.getByLabelText(/Postal Code+/i), "A1B 2C3");

      // submit

      userEvent.click(
        screen.getByRole("button", { name: /save and continue/i }),
      );
      await waitFor(() => {
        expect(actionHandler).toHaveBeenLastCalledWith(
          "registration/v2/operations",
          "POST",
          "",
          {
            body: JSON.stringify({
              registration_purpose: "OBPS Regulated Operation",
              regulated_products: [1, 2],
              name: "Op Name",
              type: "Single Facility Operation",
              naics_code_id: 1,
              activities: [2],
              process_flow_diagram:
                "data:application/pdf;name=test.pdf;base64,dGVzdA==",
              boundary_map:
                "data:application/pdf;name=test.pdf;base64,dGVzdA==",
              equipment_list:
                "data:application/pdf;name=test.pdf;base64,dGVzdA==",
              operation_has_multiple_operators: true,
              multiple_operators_array: [
                {
                  mo_is_extraprovincial_company: false,
                  mo_legal_name: "edit",
                  mo_trade_name: "edit",
                  mo_business_structure: "BC Corporation",
                  mo_cra_business_number: "999999999",
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
        "/register-an-operation/uuid2/2?title=Operation 2",
      );
    },
  );

  it("should trigger validation errors", async () => {
    fetchFormEnums();
    render(
      <OperationInformationForm
        rawFormData={{}}
        schema={await createRegistrationOperationInformationSchema()}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(7);
    });
    await waitFor(() => {
      expect(
        screen.getByText(/You must select or add an operation/i),
      ).toBeVisible();
    });
  });
});
