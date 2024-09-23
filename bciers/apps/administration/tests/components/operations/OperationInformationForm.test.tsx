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

const formData = {
  name: "Operation 3",
  type: "Single Facility Operation",
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
});
