import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/testConfig/mocks";

const testSchema = {
  type: "object",
  properties: {
    representativesTestField: {
      type: "array",
      title: "Operation Representatives",
      items: {
        type: "number",
        enum: [1, 2],
      },
    },
  },
} as RJSFSchema;

const testUiSchema = {
  representativesTestField: {
    "ui:widget": "OperationRepresentativeWidget",
    "ui:enumNames": ["Jane Doe", "John Smith"],
  },
};

const defaultFormContext = {
  operationId: "6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
};

describe("RJSF OperationRepresentativeWidget", () => {
  it("should render selected representatives with delete buttons", () => {
    const { container } = render(
      <FormBase
        schema={testSchema}
        uiSchema={testUiSchema}
        formData={{ representativesTestField: [1, 2] }}
        formContext={defaultFormContext}
      />,
    );

    const widgetContainer = container.querySelector(
      "#root_representativesTestField",
    );
    expect(widgetContainer).toBeVisible();
    expect(widgetContainer).toHaveTextContent("Jane Doe");
    expect(widgetContainer).toHaveTextContent("John Smith");

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("should remove representative and show success snackbar on delete click", async () => {
    actionHandler.mockReturnValueOnce({ success: true });

    const { container } = render(
      <FormBase
        schema={testSchema}
        uiSchema={testUiSchema}
        formData={{ representativesTestField: [1] }}
        formContext={defaultFormContext}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    const deleteIcon = container.querySelector(
      "[data-testid='DeleteOutlineIcon']",
    )!;
    await userEvent.click(deleteIcon);

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/registration/operation-representative",
      "PUT",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
      {
        body: JSON.stringify({ id: 1 }),
      },
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Operation Representative removed successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("should display error message when removing representative fails", async () => {
    actionHandler.mockReturnValueOnce({
      error: "Failed to remove representative",
    });

    const { container } = render(
      <FormBase
        schema={testSchema}
        uiSchema={testUiSchema}
        formData={{ representativesTestField: [1] }}
        formContext={defaultFormContext}
      />,
    );

    const deleteIcon = container.querySelector(
      "[data-testid='DeleteOutlineIcon']",
    )!;
    await userEvent.click(deleteIcon);

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/registration/operation-representative",
      "PUT",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
      {
        body: JSON.stringify({ id: 1 }),
      },
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to remove representative/i),
      ).toBeVisible();
    });

    expect(
      screen.queryByText(/Operation Representative removed successfully/i),
    ).not.toBeInTheDocument();
  });
});
