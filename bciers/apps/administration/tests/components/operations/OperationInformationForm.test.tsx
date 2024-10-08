import { act, fireEvent, render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import OperationInformationForm from "apps/administration/app/components/operations/OperationInformationForm";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

// Just using a simple schema for testing purposes
// OperationInformationPage test will test the proper schema with extra enums provided by the backend
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
    render(
      <OperationInformationForm
        formData={formData}
        schema={testSchema}
        operationId={operationId}
      />,
    );

    expect(screen.getByText(/Operation Name/i)).toBeVisible();
    expect(screen.getByText(/Operation Type/i)).toBeVisible();
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

    expect(actionHandler).toHaveBeenCalledTimes(3);
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
});
